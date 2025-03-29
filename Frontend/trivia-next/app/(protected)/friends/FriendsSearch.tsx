"use client";

import Button from "@/components/design/Button";
import Card from "@/components/design/Card";
import { Input } from "@/components/ui/input";
import {  LucideMailWarning, PlayIcon, SendIcon } from "lucide-react";
import React from "react";

export default function FriendsSearch({ users }: any) {
  const [search, setSearch] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState(users);
//   const [loading, setLoading] = React.useState(false);
  const [userId, setUserId] = React.useState(0);
  const [sentRequests, setSentRequests] = React.useState([]) as any;
  const [receivedRequests, setReceivedRequests] = React.useState([]);
  const [friends, setFriends] = React.useState([]);

  React.useEffect(() => {
    async function getSentRequests(id: number) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/requests/sent/${id}`
      );
      const data = await response.json();
      setSentRequests(data);
      console.log(data);
      return data;
    }
    async function getReceivedRequests(id: number) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/requests/received/${id}`
      );
      const data = await response.json();
      setReceivedRequests(data);
      return data;
    }
    async function getFriends(id: number) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/${id}`
      );
      const data = await response.json();
      setFriends(data);
      return data;
    }
    async function getUserId() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setUserId(data.id);
      getSentRequests(data.id);
      getReceivedRequests(data.id);
      getFriends(data.id);
      setFilteredUsers((prev: any) =>
        prev.filter(
          (user: any) =>
            user.id !== data.id && user.id !== sentRequests.senderId
        )
      );
      return data.id;
    }
    getUserId();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    const sentRequestIds = sentRequests.map((req: any) => req.receiverId);

    setFilteredUsers(
      users.filter(
        (u: any) =>
          u.id !== userId &&
          !sentRequestIds.includes(u.id) &&
          u.name.toLowerCase().includes(searchTerm)
      )
    );
  };

  const handleSubmit = async (receiverId: number) => {
    const senderId = userId;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/send-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ senderId, receiverId }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error sending friend request:", error);
      return [];
    }
  };

  const handleAccept = async (
    requestId: number,
    senderId: any,
    receiverId: any
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/accept-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId, senderId, receiverId }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      return [];
    }
  };
  console.log(friends);
  return (
    <div className="mt-16 pb-8 space-y-5 w-[85vw] md:w-[70vw]">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Friends</h1>
        <p className="text-sm">{friends.length} friends</p>
      </div>
      <div className="space-y-3">
        {friends.length > 0 ? (
          friends.map((friend: any) => {
            return (
              <Card key={friend.id}>
                <div className="flex justify-between">
                  <div>
                    <p>{friend.friend.name}</p>
                    <p className="text-sm">{friend.friend.email}</p>
                  </div>
                  <Button className="p-2" variant="outline">
                    <PlayIcon className="size-5" />
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <p>No friends</p>
        )}
      </div>

      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Friend Requests</h1>
        {receivedRequests.length > 0 ? (
          receivedRequests.map((request: any) => (
            <Card key={request.id} className="flex justify-between">
              <div>
                <p>{request.sender.name}</p>
                <p>{request.sender.email}</p>
              </div>
              <Button
                onClick={() => {
                  handleAccept(
                    request.id,
                    request.senderId,
                    request.receiverId
                  );
                }}
                className="p-2"
                variant="outline"
              >
                Accept
              </Button>
            </Card>
          ))
        ) : (
          <p>No friend requests</p>
        )}
      </div>
      <div>
        <div>
          <h1 className="text-2xl font-bold">Search for friends</h1>
        </div>
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search for friends"
        />
        {search
          ? filteredUsers.map((user: any) => {
              return (
                <Card key={user.id}>
                  <div className="flex justify-between">
                    <div>
                      <p>{user.name}</p>
                      <p>{user.email}</p>
                    </div>
                    <Button
                      onClick={() => handleSubmit(user.id)}
                      className="p-2"
                      variant="outline"
                    >
                      <SendIcon className="size-5" />
                    </Button>
                  </div>
                </Card>
              );
            })
          : null}
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold pb-3">Friend Requests sent</h1>
        {sentRequests.length > 0 ? (
          sentRequests.map((request: any) => (
            <Card key={request.id} className="flex justify-between">
              <div className="flex w-full justify-between">
                <p>{request.receiver.name}</p>
                <LucideMailWarning className="text-yellow-500" />
              </div>
              {/* <Button onClick={()=>{handleAccept(request.id, request.senderId, request.receiverId)}} className='p-2' variant='outline'>Accept</Button> */}
            </Card>
          ))
        ) : (
          <p>No friend requests sent</p>
        )}
      </div>
      
    </div>
  );
}
