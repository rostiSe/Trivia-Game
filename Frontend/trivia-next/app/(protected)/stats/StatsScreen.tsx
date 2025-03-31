"use client"

import { useAuthStore } from '@/store/auth.store'
import React, { useEffect } from 'react'

export default function StatsScreen() {
    const [stats, setStats] = React.useState<any>(null)
    const { user } = useAuthStore()
    useEffect(() => {
        async function fetchStats() {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/stats/${user?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch stats')
            }
            const data = await response.json()
            setStats(data)
            console.log(data)
        }
        fetchStats()
    }, [user])
  return (
    <div>
        <h1>Stats</h1>
        <p>Here you can see your stats</p>
        <p>
            Matches played: {stats?.matches || 0}<br />
            Points won: {stats?.points || 0}<br />
        </p>
    </div>
  )
}
