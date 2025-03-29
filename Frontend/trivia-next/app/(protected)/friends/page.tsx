import Card from '@/components/design/Card'
import React from 'react'
import FriendsSearch from './FriendsSearch'

export default async function FriendsPage() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
        const users = await response.json()
        console.log(users)
  return (
    <div>
        <FriendsSearch users={users}/>
    </div>
  )
}
