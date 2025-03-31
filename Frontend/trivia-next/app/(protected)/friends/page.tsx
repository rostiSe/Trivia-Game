import React from 'react'
import FriendsSearch from './FriendsSearch'

export default async function FriendsPage() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
        if (!response.ok) {
            throw new Error('Failed to fetch users')
        }

        const users = await response.json()
        if (!users) {
            throw new Error('No users found')
        }
        console.log(users)
  return (
    <div>
        <FriendsSearch users={users}/>
    </div>
  )
}
