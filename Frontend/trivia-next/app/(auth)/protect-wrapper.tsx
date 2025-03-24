"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

interface ProtectedWrapperProps {
    children: React.ReactNode
}

export default function ProtectedWrapper({children} : ProtectedWrapperProps) {
    const router = useRouter()
    useEffect(()=>{
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/sign-in')
        }
    }, [router])
  return (
    <div>
        {children}
    </div>
  )
}
