"use client"

import Button from '@/components/design/Button'
import Card from '@/components/design/Card'
import { Input } from '@/components/ui/input'
import { SendIcon } from 'lucide-react'
import React from 'react'

export default function FriendsSearch({users}: any) {
    const [search, setSearch] = React.useState('')
    const [filteredUsers, setFilteredUsers] = React.useState(users)
    const [loading, setLoading] = React.useState(false)
    const [userId, setUserId] = React.useState(0)
    const [requests, setRequests] = React.useState([])

    React.useEffect(()=>{
        async function getRequests(id: Number) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/requests/${id}`)
            const data = await response.json()
            setRequests(data)
            return data
        }
        async function getUserId() {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                credentials: 'include'
            })
            const data = await response.json()
            setUserId(data.id)
            getRequests(data.id)
            return data.id
        }
        getUserId()
        

    },[])
    const handleSearch = (e: any) => {
        setSearch(e.target.value)
        const searchTerm = e.target.value.toLowerCase()
        const filtered = users.filter((user: any) => 
            user.name.toLowerCase().includes(searchTerm)
        )
        setFilteredUsers(filtered)
    }
    const handleSubmit = async (receiverId: Number) => {
        const senderId = userId
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/send-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({senderId, receiverId}),
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Failed to send friend request')
            }
            const data = await response.json()
            console.log(data)
            
        } catch (error) {
            console.error("Error sending friend request:", error);
            return [];
            
        }
    }
  return (
    <div className='mt-16 space-y-5'>
        <div>
            <h1 className='text-2xl font-bold'>Friend Requests</h1>
            {requests.length > 0 ? requests.map((request: any) => (
                <Card key={request.id} className='flex justify-between'>
                    <div>
                        <p>{request.sender.name}</p>
                        <p>{request.sender.email}</p>
                    </div>
                    <Button className='p-2' variant='outline'>Accept</Button>
                </Card>
            )) : (
                <p>No friend requests</p>
            )}
        </div>
        <div>
            <h1 className='text-2xl font-bold'>Search for friends</h1>
        </div>
        <Input value={search} onChange={handleSearch} placeholder="Search for friends"/>
        {filteredUsers.map((user: any) => {
            return <Card key={user.id}>
                <div className='flex justify-between'>
                    <div>
                    <p>{user.name}</p>
                    <p>{user.email}</p>

                    </div>
                    <Button onClick={()=>handleSubmit(user.id)}  className='p-2' variant='outline'><SendIcon className="size-5"/></Button>
                </div>
            </Card>
        })}
    </div>
  )
}
