"use client"

import { useAuth } from "@/hooks/auth-context"
import { db } from "@/lib/firebase"
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore"
import { CircleAlert } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { 
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem
  } from "./ui/dropdown-menu"
import { toast } from "sonner"
import { useRoomContext } from "@/hooks/room-context"



type ChatType = {
    chat: string
    sender_email: string
    photo_url?: string
    date: Timestamp,
    id: string,
    type: string,
    sender?: string,
    email?: string
}


const ChatMessage = ({roomId}:{roomId: string}) => {
  const [messages, setMessages ] = useState<ChatType[]>([])

  const {user} = useAuth()
  const {room, getRoom} = useRoomContext()

  const owner = user?.email


  //get room details
 useEffect(() => {
   getRoom(roomId)
 },[])
  //fetch and live listener for text
  useEffect(() => {
    if(!room) return
    const msgRef = collection(db,'rooms', roomId, 'messages');
    const q = query(msgRef, orderBy('date','asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const msgs = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       })) as ChatType[]

       setMessages(msgs)
    });

    return () => unsubscribe()
  },[roomId])

//delete logic foe chat
  const deleteChat = async(roomId: string, chatId: string) => {
    const chatRef = doc(db,'rooms', roomId, 'messages', chatId);
    try {
      await deleteDoc(chatRef)
      toast.success('Chat deleted successfully!')
    } catch (error) {
      console.log(error)
      toast.error("Failed, try again later")
    }
}
    
  return (
    <div className={`bg-gray-300 h-[400px] overflow-y-auto scrollbar-hide`}>
      {
        messages.length === 0 ? (
          <div className="flex justify-center items-center h-[400px] text-white">Start chat</div>

        ) :(
         messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex overflow-y-auto p-4 ${
              msg.sender_email === 'system' ?'justify-center':
              msg.sender_email === owner?'justify-end':'justify-start'
            }`}
          >
            <div 
               className={`max-w-sm flex gap-3 items-center rounded py-1 px-3
               ${ msg?.sender_email === 'system'?`${user?.email !== msg?.email && 'bg-gray-500 text-sm italic opacity-50 text-white'}`:
                  msg?.sender_email === owner? 'bg-sky-400 text-white':'bg-base-100'
                }
               `}>
                {
                  msg?.sender_email ==='system' ? (
                    user?.email !== msg?.email ? (
                      <span>{msg?.chat}</span>
                    ):(
                      messages.length < 2 && 
                      <span className="h-56 flex justify-center items-center">Start conversation!</span>
                    ) 
                  ):(
                    <>
                    <Image src={msg?.photo_url!} className="rounded-full" width={30} height={30} alt=""/>
                    <div>
                       <p>{msg?.chat}</p>
                        <span className="justify-self-end text-sm text-gray-400">{msg.date?.toDate().toLocaleString()}</span>
                    </div>
                    {
                      user?.email === msg.sender_email && (
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger><CircleAlert className="w-4 h-4 text-gray-600" /></DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem className="cursor-pointer" onClick={() =>deleteChat(roomId, msg.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )
                    }
                    </>
                  )
                }
            </div>
          </div>
         ))
        )
      }
       
    </div>
  )
}

export default ChatMessage