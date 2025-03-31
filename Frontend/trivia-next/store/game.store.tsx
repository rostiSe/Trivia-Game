import { create } from "zustand";

interface GameState {
  category: string;
  categoryId: number ;
  difficulty: string;
  questionAmount: number;

  points: number;

  addPoint: (points: any) => void;
  addMatch: (userId: any) => void;
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
  points: 0,

  addMatch: async (userId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/game/add-match`,
    {
        headers: {
          'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({userId })
    }
    );
    const data = await response.json();
    console.log("Response:", data); // Debug
    if (!response.ok) {
        console.error("Error adding points:", data.error || "Unknown error");
        return;
    }return data.points;
    }
  ,
  addPoint: async (userId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/game/add-point`,
    {
        headers: {
          'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({userId, points: 1 })
    }
    );
    const data = await response.json();
    console.log("Response:", data); // Debug
    if (!response.ok) {
        console.error("Error adding points:", data.error || "Unknown error");
        return;
    }return data.points;
    }
  ,
  setCategoryId: (categoryId) => set({ categoryId }),
  setCategory: (category) => set({ category }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setQuestionAmount: (questionAmount) => set({ questionAmount }),
}));
