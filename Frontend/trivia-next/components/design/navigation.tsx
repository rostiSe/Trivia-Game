"use client"

import { Home } from 'lucide-react'
import React from 'react'

export default function NavigationBar() {
  return (
    <div>
    <nav className="flex items-center p-4 bg-transparent">
        <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 cursor-pointer  text-purple-200 hover:text-pink-600 transition-colors"
        >
            <Home size={24} />
            Back
        </button>
    </nav>
    </div>
  )
}
