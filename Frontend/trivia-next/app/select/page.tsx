'use client'

import React, { Suspense, useEffect, useState } from 'react';
import { BookOpenIcon, BarChart3Icon, TrophyIcon, BotIcon, Minus, Plus } from 'lucide-react';
import Button from '@/components/design/Button';
import Card from '@/components/design/Card';
import { useGameContext } from '@/lib/GameContext.';
import { Alert } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
interface SelectionScreenProps {
  onStartGame: () => void;
}
interface Category {
  id: string;
  name: string;
}
const difficulties = [{
  id: 'easy',
  name: 'Easy',
  color: 'text-green-400'
}, {
  id: 'medium',
  name: 'Medium',
  color: 'text-yellow-400'
}, {
  id: 'hard',
  name: 'Hard',
  color: 'text-red-400'
}];

const SelectionScreen = () => {
  const {
    setGameOptions
  } = useGameContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(Math.floor(Math.random() * 25));
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();



  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:3001/api/trivia/categories');
        const data = await response.json();
        setCategories(data.trivia_categories)
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }finally{
        setLoading(false)
      }
    }
    fetchCategories()
  }, []);
  
  const handleStartGame = () => {
    if (selectedCategory && selectedDifficulty) {
      setGameOptions({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        questionCount,
        id: selectedCategoryId,
        amount: questionCount
      });
      const selectedFields= {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        questionCount,
        id: selectedCategoryId,
        amount: questionCount

      }
      localStorage.setItem('Quiz-Options', JSON.stringify(selectedFields));
      router.push('/quiz')

    } 
  };

  const variation ={
    hidden: {
      opacity: 1,
      height: "23rem"
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.5
      }
    }
  }
  const handleDropdownOpen = () => {
    setShowDropdown(!showDropdown)
    console.log(showDropdown)
  }
  const handleDropdownClose = () => {
    setShowDropdown(false)
  }
  return <div className="container mx-auto px-2 py-10 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Trivia Master
        </h1>
        <p className="text-xl text-indigo-200">
          Test your knowledge with challenging questions!
        </p>
      </div>
      <div className="space-y-8">
        {/* Category Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <BookOpenIcon className="mr-2" size={24} />
            Select Category
          </h2>
          {loading ? <div>Loading</div> : (
 <motion.div variants={variation} initial="hidden" animate={showDropdown?"visible":"hidden"}  className={`relative grid z-0 px-2 py-2 grid-cols-2 md:grid-cols-3 gap-4 ${showDropdown?"":"overflow-hidden"}`} >
            
 {categories.map(category => {
 return <Card key={category.id} selected={selectedCategoryId === Number(category.id)} onClick={() =>{ setSelectedCategory(category.name); setSelectedCategoryId(Number(category.id))}}>
       <div className="flex flex-col items-center text-center">
         <BotIcon size={32} className="mb-2 text-purple-400" />
         <span>{category.name}</span>
       </div>
     </Card>;
})}
<div className='absolute bottom-0 flex items-center justify-center left-0 w-full h-[4rem] bg-gradient-to-b backdrop-blur-xs rounded-xl to-purple-900/50 from-purple-900/10 z-10'>
<button onClick={()=>handleDropdownOpen()} className="cursor-pointer text-purple-100 text-sm p-3 rounded-lg hover:scale-105 transition-all  border border-purple-500">{!showDropdown ? "More Categories":"Less Categories"}</button>

</div>
</motion.div>
          )}
        </div>
        {/* Difficulty Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <BarChart3Icon className="mr-2" size={24} />
            Select Difficulty
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {difficulties.map(difficulty => <Card key={difficulty.id} selected={selectedDifficulty === difficulty.id} onClick={() => setSelectedDifficulty(difficulty.id)}>
                <div className="flex flex-col items-center text-center">
                  <span className={`text-xl font-bold ${difficulty.color}`}>
                    {difficulty.name}
                  </span>
                </div>
              </Card>)}
          </div>
        </div>
        {/* Question Count */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Number of Questions</h2>
          <div className="bg-indigo-800/60 backdrop-blur-sm rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center">
              <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.98}} className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-2xl" onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}>
                <Minus size={24} />
              </motion.button>
              <span className="text-3xl font-bold">{questionCount}</span>
              <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.98}} className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-2xl" onClick={() => setQuestionCount(Math.min(50, questionCount + 5))}>
                <Plus size={24} />
              </motion.button>
            </div>
            <input type="range" min="5" max="50" step="5" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full mt-4 accent-purple-500" />
          </div>
        </div>
        {/* Start Button */}
        <div className="mt-8 flex justify-center">
        {error ?(
          <Alert variant="destructive" className="mb-4">
             "Please select a category and difficulty to start the game."
          </Alert>) : null
          }
          <Button onClick={handleStartGame} disabled={!selectedCategory || !selectedDifficulty} variant="primary" className="text-xl py-4 px-10">
            Start Game
          </Button>
        </div>
      </div>
    </div>;
};
export default SelectionScreen;