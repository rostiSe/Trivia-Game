import React from 'react'
import QuestionScreen from './QuestionScreen'
import { GameProvider } from '@/lib/GameContext.'

export default function Quiz() {
  return (
    <div>
      <GameProvider>
      <QuestionScreen />
      </GameProvider>
    </div>
  )
}
