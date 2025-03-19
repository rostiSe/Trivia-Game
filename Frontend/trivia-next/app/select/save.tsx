"use client";
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button'
// Removed unused console import
import { SaveIcon } from 'lucide-react'
import React, { useState } from 'react'

export default function SaveEl({questions}:{questions: any}) {
  const [savedQuestion, setSavedQuestion] = useState(false)
  const [error, setError] = useState(false)
    async function saveQuestionToDatabae(){
      try {
        const response = await fetch('http://localhost:3001/api/questions/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(questions)
        })
        const data = await response.json()
        console.log(data)
        setSavedQuestion(true)
      } catch (error) {
        setError(true)

        console.error("Error saving question to database:", error)
      }
     
    }

  return (
    <div>
        {error?<Alert>Question allready saved to database</Alert>:null}
        <Button onClick={()=>saveQuestionToDatabae()} disabled={savedQuestion} className='bg-green-600/40 transition-all hover:bg-green-600/70 hover:shadow-lg -2 text-indigo-100 -green-800 h-[3rem]' >
            <SaveIcon size={24} />
            Save
        </Button>
    </div>
  )
}
