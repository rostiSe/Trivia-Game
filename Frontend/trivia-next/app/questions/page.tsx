"use client"

import Card from '@/components/design/Card'
import { Badge } from '@/components/ui/badge'
import React, { useEffect } from 'react'

interface Question {
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export default function QuestionsPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  useEffect(()=>{
    async function fetchQuestions(){
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`)
        const data = await response.json()
        setQuestions(data)
        return data
      } catch (error) {
        console.error("Error fetching questions:", error)
    }
  }
  fetchQuestions()
}, [])
console.log(questions)
  return (
    <div>
      <div className='p-5 py-10 text-center'>
        <h1 className='text-indigo-100 font-bold text-4xl'>Saved Questions</h1>
      </div>
      <div className='space-y-3 py-10 px-2'>

      {questions.map((question, idx)=>(
        
        <Card key={idx}>
                 <Badge className='bg-purple-700 text-purple-300 mb-2'>{question.difficulty}</Badge>

          <h1>{question.question}</h1>
          <p>{question.correct_answer}</p>
          <p>{question.incorrect_answers}</p>
        </Card>
      ))}
            </div>

    </div>
  )
}
