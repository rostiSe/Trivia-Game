"use client"

import { useState, createContext, useContext, ReactNode } from 'react';
interface GameOptions {
  category: string;
  difficulty: string;
  questionCount: number;
  id: number;
  amount: number;
}
interface GameContextType {
  gameOptions: GameOptions;
  setGameOptions: (options: GameOptions) => void;
}
const defaultGameOptions: GameOptions = {
  category: '',
  difficulty: '',
  questionCount: 10,
  id: 0,
  amount: 10,
};
const GameContext = createContext<GameContextType | undefined>(undefined);
export const GameProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [gameOptions, setGameOptions] = useState<GameOptions>(defaultGameOptions);
  return <GameContext.Provider value={{
    gameOptions,
    setGameOptions
  }}>
      {children}
    </GameContext.Provider>;
};
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};