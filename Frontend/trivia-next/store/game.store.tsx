import { create } from "zustand";

interface GameState {
  category: string;
  categoryId: number ;
  difficulty: string;
  questionAmount: number;

  setCategory: (category: string) => void;
  setCategoryId: (categoryId: number) => void;
  setDifficulty: (difficulty: string) => void;
  setQuestionAmount: (amount: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  category: "",
  categoryId: 9,
  difficulty: "",
  questionAmount: 10,

  setCategoryId: (categoryId) => set({ categoryId }),
  setCategory: (category) => set({ category }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setQuestionAmount: (questionAmount) => set({ questionAmount }),
}));
