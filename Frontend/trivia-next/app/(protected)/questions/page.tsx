"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/design/Card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/design/Button";
import { PenBoxIcon, Trash, Trash2Icon } from "lucide-react";
import { decode } from "html-entities";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";

interface Question {
  id: string; // If you're using Mongo ObjectId strings
  difficulty: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  category: string;
}
// For local editing form:
interface EditingQuestion extends Question {
  answers: string[]; // Merged correct + incorrect
  correctAnswer: string; // Which is correct in the local edit form
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  // Track which question IDs are currently being deleted
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  // If null, not editing anything. Otherwise, store the question + form fields
  const [editingQuestion, setEditingQuestion] =
    useState<EditingQuestion | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions`
        );
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }
    fetchQuestions();
  }, []);

  async function deleteQuestion(id: string) {
    // Mark this question as "loading"
    setLoadingIds((prev) => [...prev, id]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      if (response.ok) {
        // Remove the question from state immediately upon success
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        console.error(
          "Server responded with an error when deleting:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      // Remove from loading
      setLoadingIds((prev) => prev.filter((loadingId) => loadingId !== id));
    }
  }
  // Start editing a question
  function startEditing(q: Question) {
    // Merge correct + incorrect answers into a local array
    const mergedAnswers = [q.correctAnswer, ...q.incorrectAnswers];
    setEditingQuestion({
      ...q,
      answers: mergedAnswers,
      correctAnswer: q.correctAnswer,
    });
  }

  // Cancel editing
  function cancelEditing() {
    setEditingQuestion(null);
  }

  // Update the local "answers" array text
  function handleAnswerChange(index: number, newValue: string) {
    setEditingQuestion((prev) => {
      if (!prev) return prev;
      const updatedAnswers = [...prev.answers]; // Copy current answers
      updatedAnswers[index] = newValue; // Replace only at index
      return { ...prev, answers: updatedAnswers };
    });
  }

  // Radio button sets the "correctAnswer"
  function handleSetCorrectAnswer(answer: string) {
    if (!editingQuestion) return;
    setEditingQuestion({ ...editingQuestion, correctAnswer: answer });
  }

  // Actually SAVE the edited question to the backend
  async function saveEditedQuestion() {
    if (!editingQuestion) return;

    // Convert back to the shape your DB expects:
    // e.g. correctAnswer is correctAnswer, and
    // other answers are everything else not the correct one.
    const newCorrect = editingQuestion.correctAnswer;
    const newIncorrect = editingQuestion.answers.filter(
      (a) => a !== newCorrect
    );

    const updatedPayload: Question = {
      id: editingQuestion.id,
      question: editingQuestion.question,
      correctAnswer: newCorrect,
      incorrectAnswers: newIncorrect,
      difficulty: editingQuestion.difficulty,
      category: editingQuestion.category,
    };
    console.log("Saving edited question:", updatedPayload);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPayload),
        }
      );
      const data = await response.json();
      console.log("Edit response:", data);

      // Update local state to reflect the changes
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id ? { ...q, ...updatedPayload } : q
        )
      );
      // Reset editingQuestion
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error saving question to database:", error);
    }
  }
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Saved Questions
        </h1>
        <p className="text-xl text-indigo-200">
          Review or edit your saved questions
        </p>
      </div>
      <div className="space-y-5 py-10 px-2">
        {questions.map((question) => {
          const isDeleting = loadingIds.includes(question.id);
          const isEditing = editingQuestion?.id === question.id;
          console.log(question);

          // We'll build a local "answers" array to display either from editingQuestion or the question object
          const answersInView = isEditing
            ? editingQuestion?.answers || []
            : [question.correctAnswer, ...question.incorrectAnswers];

          return (
            <Card key={question.id}>
              <div className="w-full flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge className="bg-purple-700 text-purple-300 mb-2">
                    {question.difficulty}
                  </Badge>
                  <Badge className="bg-indigo-600 text-purple-200 mb-2">
                    {question.category}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => startEditing(question)}
                      className="bg-green-600/40 transition-all cursor-pointer group hover:shadow-lg text-indigo-100 px-2 py-2"
                    >
                      <PenBoxIcon className="text-indigo-300 transition-all group-hover:text-indigo-200 size-5" />
                    </Button>
                  )}
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        disabled={isDeleting}
                        className="bg-red-600/40 transition-all cursor-pointer group hover:shadow-lg text-indigo-100 px-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <Trash2Icon className="text-red-500 transition-all group-hover:text-indigo-200 size-5" />
                        ) : (
                          <Trash className="text-red-500 transition-all group-hover:text-pink-400 size-5" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-indigo-700 mt-2 border-indigo-500 w-fit">
                      <div className="flex w-full gap-4">
                        <Button
                          onClick={() => deleteQuestion(question.id)}
                          variant="outline"
                          disabled={isDeleting}
                          className="bg-red-600/40 transition-all cursor-pointer group hover:shadow-lg text-indigo-100 px-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Yes
                        </Button>
                        <PopoverClose>
                          <Button
                            variant="outline"
                            disabled={isDeleting}
                            className="bg-red-600/40 transition-all cursor-pointer group hover:shadow-lg text-indigo-100 px-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            No
                          </Button>
                        </PopoverClose>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* EITHER EDIT MODE OR DISPLAY MODE */}
              {isEditing ? (
                <div className="mt-4">
                  {/* Edit question text */}
                  <input
                    type="text"
                    value={editingQuestion?.question}
                    onChange={(e) =>
                      setEditingQuestion((prev) =>
                        prev ? { ...prev, question: e.target.value } : prev
                      )
                    }
                    className="w-full bg-indigo-900/50 border border-indigo-500 rounded-lg p-2 mb-4"
                  />

                  {/* Edit answers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {answersInView.map((answer, index) => (
                      <div key={index} className="relative">
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) =>
                            handleAnswerChange(index, e.target.value)
                          }
                          className="w-full bg-indigo-900/50 border border-indigo-500 rounded-lg p-2 pr-8"
                        />
                        {/* Radio to select correct answer */}
                        <label className="absolute right-2 top-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={answer === editingQuestion?.correctAnswer}
                            onChange={() => handleSetCorrectAnswer(answer)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Save/Cancel buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="primary" onClick={saveEditedQuestion}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // NOT EDITING => Just show the question & answers
                <div className="mt-4">
                  <h1 className="text-xl pb-5 font-medium">
                    {decode(question.question)}
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {answersInView.map((answer, idx) => {
                      const isCorrect = answer === question.correctAnswer;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            isCorrect
                              ? "bg-green-800/30 border-2 border-green-400"
                              : "bg-indigo-800/30"
                          }`}
                        >
                          {decode(answer)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
