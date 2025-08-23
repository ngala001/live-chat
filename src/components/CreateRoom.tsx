"use client"
import { FormEvent, useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { joinOrCreateRoom, userStatus } from '@/lib/room-actions'
import { useAuth } from '@/hooks/auth-context'
import { useCreateRoomStore } from '@/store/create-roomStore'

const CreateRoom = () => {
    const [loading, setLoading ] = useState(false)

    const router = useRouter()
    const {user} = useAuth()

    const {username, roomName, setRoomName, setUsername} = useCreateRoomStore()

    const createRoom = async(e: FormEvent) => {
        e.preventDefault();

        if(!username.trim() || !roomName.trim()) {
          toast.error("Please fill all required fields")
          return           
        }
        
       try {
           setLoading(true)
            const {room, isNew}= await joinOrCreateRoom(roomName, username, user?.email!)
            userStatus(room?.id, user?.uid!, username)

           setRoomName(roomName)
           setUsername(username)
           toast.success(isNew ? "Room created successfully":"Rejoined an existing room")
           router.push(`chatroom/${room.id}`)

       } catch (error) {
         console.log(error)
         toast.error("Failed to join the Room")
       }finally {
        setLoading(false)
       }

    }

  return (
    <div className='max-w-sm mx-auto shadow-sm p-2 rounded-md'>
       <h1 className='font-bold text-3xl border-b-2 border-gray-400 pb-2'>Join or Create Room</h1>
        <form onSubmit={createRoom}>
            <div className='grid gap-4 mt-4'>
                <Label>Username</Label>
                <Input 
                  type='text' 
                  placeholder='example-(@patel)'
                  onChange={(e) => setUsername(e.target.value)}

                />
              </div>
            <div className='grid gap-4 mt-4'>
                <Label>Room name</Label>
                <Input 
                  type='text' 
                  placeholder='Room'
                  onChange={(e) => setRoomName(e.target.value)}

                />
            </div>
            <div className='text-center mt-4'>
                <Button variant={"outline"} disabled={loading} className='cursor-pointer'>
                    { 
                       !loading ? "Join Room" :
                       <span className='flex items-center gap-2'>
                           <span className='loading loading-sm'></span>
                           <span>Joining...</span>  
                       </span>
                    }

                </Button>
            </div>
        </form>
    </div>
  )
}

export default CreateRoom