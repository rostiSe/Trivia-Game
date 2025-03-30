"use client";
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store';
import { SaveIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface Question {
  id?: number;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category?: string;
  difficulty?: string;
  type?: string;
}

export default function SaveEl({questions}:{questions: Question}) {
  const { user } = useAuthStore()
  const [savedQuestion, setSavedQuestion] = useState(false)
  useEffect(()=>{
    setSavedQuestion(false)
  },[questions])
  async function saveQuestionToDatabae() {
    try {
      // Check if user is logged in
      if (!user || !user.id) {
        toast.error('You need to be logged in to save questions');
        return;
      }
      
      console.log("Sending question data:", questions); // Debug
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questions: questions, // Send the entire question object
          userId: user.id
        }),
        credentials: 'include'
      });
      
      // Get the response data first
      const data = await response.json();
      console.log("Response:", data);
      
      if (!response.ok) {
        if (response.status === 409) {
          toast.error('Question already saved');
        } else {
          toast.error(data.error || 'Failed to save question');
        }
      } else {
        setSavedQuestion(true);
        toast.success('Question saved successfully');
      }
    } catch (error) {
      console.error("Error saving question to database:", error);
      toast.error("Failed to save question");
    }
  }
  
  return (
    <div>
      <Button 
        onClick={saveQuestionToDatabae}  
        className='bg-green-600/40 transition-all hover:bg-green-600/70 hover:shadow-lg text-indigo-100 h-[3rem]'
        disabled={savedQuestion} // Disable if already saved
      >
        <SaveIcon size={24} />
        {savedQuestion ? 'Saved' : 'Save'}
      </Button>
    </div>
  )
}