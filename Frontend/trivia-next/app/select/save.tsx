"use client";
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner';
// Removed unused console import
import { SaveIcon, TriangleAlert } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  // any other fields
}


export default function SaveEl({questions}:{questions: Question}) {
  const [savedQuestion, setSavedQuestion] = useState(false)
    async function saveQuestionToDatabae(){
      try {
        const response = await fetch('http://localhost:3001/api/questions/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(questions)
        })
        if (!response.ok) {
          toast.error('Allready saved')
        }   else{
          setSavedQuestion(true)
          toast.success('Question saved')
  
        }  
        const data = await response.json()
        console.log(data)

      } catch (error) {

        console.error("Error saving question to database:", error)
      }
     
    }

  return (
    <div>
        <Button onClick={()=>saveQuestionToDatabae()}  className='bg-green-600/40 transition-all hover:bg-green-600/70 hover:shadow-lg -2 text-indigo-100 -green-800 h-[3rem]' >
            <SaveIcon size={24} />
            Save
        </Button>
    </div>
  )
}
