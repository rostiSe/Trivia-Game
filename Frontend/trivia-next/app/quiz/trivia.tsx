import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import React from 'react'

const AnswerCards= ( {answer, onNext, onPrev, className}:{answer: string, onNext: ()=> void, onPrev: ()=>void, className?: string })=> {
    return(
            <Card className={cn(" cursor-pointer hover:shadow-lg hover:border-gray-700", className)} onClick={onNext}>
                <CardContent>
                    <p>{answer}</p>
                </CardContent>
            </Card>

    )
}
export default function TriviaContainer({incorrect_answers, correct_answer, question, showAnswers, onNext, onPrev}: {showAnswers: boolean,incorrect_answers: string[], correct_answer: string, question: string, onNext: ()=>void, onPrev: ()=>void}) {
  
    const answers = [...incorrect_answers, correct_answer]
 
    return (
        <Card className='w-[30rem] h-[30rem]'>
            <CardHeader>
                <h1>Trivia</h1>
                <h1>{question}</h1>
            </CardHeader>
            <CardContent>
                <p>Trivia questions will go here</p>
                <div className='grid grid-cols-2 gap-4'>
                    {answers.map((answer, index) => (
                        <AnswerCards className={showAnswers && answer!==correct_answer ? "bg-red-500/50" : "bg-green-500/50"} answer={answer} key={index} onNext={onNext} onPrev={onPrev}/>
                    ))}
        </div>            </CardContent>
        </Card>
  )
}
