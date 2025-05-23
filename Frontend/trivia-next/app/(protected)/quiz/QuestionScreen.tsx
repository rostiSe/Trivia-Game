"use client";

import React, { useEffect, useState } from "react";
import { ClockIcon, ArrowRightIcon, HomeIcon } from "lucide-react";
import Card from "@/components/design/Card";
import Button from "@/components/design/Button";
import ProgressBar from "@/components/design/ProgressBar";
import AnswerTile from "@/components/design/AnswerTile";
import { useGameContext } from "@/lib/GameContext.";
import Link from "next/link";
import SaveEl from "../select/save";
import { decode } from "html-entities";
import { useGameStore } from "@/store/game.store";
import { useAuthStore } from "@/store/auth.store";

type Question = {
  id: number;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const QuestionScreen = () => {
  const { gameOptions } = useGameContext();
  const { category, difficulty, questionAmount, categoryId, addPoint, addMatch } =
    useGameStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const { user } = useAuthStore();
  // Fetch trivia questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trivia?category=${categoryId}&difficulty=${difficulty}&amount=${questionAmount}&type=multiple`
        );
        const data = await response.json();
        console.log("Fetched data:", data);
        if (data) {
          setQuestions(data);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
      }
    }
    fetchQuestions();
    console.log(user);
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      // Merge correct + incorrect answers
      const mergedAnswers = [
        ...questions[0].incorrect_answers,
        questions[0].correct_answer,
      ];

      // Shuffle them in-place
      shuffleArray(mergedAnswers);

      // Now update state with the shuffled answers
      setAnswers(mergedAnswers);
    }
  }, [questions]);

  useEffect(() => {
    const storedOptions = localStorage.getItem("Quiz-Options");
    if (storedOptions) {
      const options = JSON.parse(storedOptions);
      useGameStore.setState({
        category: options.category,
        categoryId: options.categoryId,
        difficulty: options.difficulty,
        questionAmount: options.questionAmount,
      });
    }
  }, [category, difficulty, categoryId]);

  function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Timer effect
  useEffect(() => {
    if (showResult || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, gameOver, currentQuestionIndex]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };
  const handleCheckAnswer = () => {
    setShowResult(true);
    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore((prev) => prev + 1);
      addPoint(user?.id);
    }
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      const nextIndex = currentQuestionIndex + 1;
      const mergedAnswers = [
        ...questions[nextIndex].incorrect_answers,
        questions[nextIndex].correct_answer,
      ];

      console.log("Next question index:", nextIndex, questions[nextIndex]);
      console.log("Before shuffle:", mergedAnswers);
      shuffleArray(mergedAnswers);
      console.log("After shuffle:", mergedAnswers);
      setAnswers(mergedAnswers);
    } else {
      setGameOver(true);
      addMatch(user?.id);
    }
  };
  console.log(gameOptions);

  if (!questions || questions.length === 0) {
    return <div>Loading...</div>;
  }
  if (gameOver) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Game Over!
          </h1>
          <p className="text-2xl mb-6">
            Your score:{" "}
            <span className="font-bold text-purple-400">{score}</span> out of{" "}
            {questions.length}
          </p>
          <div className="text-xl mb-8">
            {score === questions.length ? (
              <p className="text-green-400">
                Perfect score! You're a trivia master!
              </p>
            ) : score >= questions.length / 2 ? (
              <p className="text-yellow-400">Good job! Keep practicing!</p>
            ) : (
              <p className="text-pink-400">Better luck next time!</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center justify-center"
            >
              <Link href="/">
                <HomeIcon size={18} className="mr-2" />
                Main Menu
              </Link>
            </Button>
            <Button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setTimeLeft(30);
                setScore(0);
                setGameOver(false);
              }}
            >
              Play Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-14 max-w-4xl min-h-screen">
      <div className="mb-6">
        <ProgressBar
          current={currentQuestionIndex + 1}
          total={questions.length}
        />
      </div>
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm text-indigo-300">
              Category: <span className="font-medium">{category}</span>
            </span>
            <div className="text-sm text-indigo-300">
              Difficulty: <span className="font-medium">{difficulty}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SaveEl questions={questions[currentQuestionIndex]} />

            <div className="flex items-center bg-indigo-900/80 px-3 py-1 rounded-lg">
              <ClockIcon size={18} className="mr-1 text-yellow-400" />
              <span
                className={`font-mono font-bold ${
                  timeLeft < 10 ? "text-red-400" : "text-yellow-400"
                }`}
              >
                {timeLeft.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">
          {decode(questions[currentQuestionIndex].question)}
        </h2>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {answers.map((answer, index) => (
          <AnswerTile
            key={index}
            text={decode(answer)}
            selected={selectedAnswer === answer}
            correct={
              showResult
                ? answer === questions[currentQuestionIndex].correct_answer
                : null
            }
            onClick={() => handleAnswerSelect(answer)}
            disabled={showResult}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Button variant="outline" className="flex items-center">
            <Link className="flex items-center" href="/select">
              <HomeIcon size={18} className="mr-2" />
              Quit
            </Link>
          </Button>
        </div>

        {showResult ? (
          <Button
            className="flex h-fit items-center gap-2"
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRightIcon size={18} className="ml-2" />
              </>
            ) : (
              "See Results"
            )}
          </Button>
        ) : (
          <Button
            className="h-fit"
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
          >
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
};
export default QuestionScreen;
