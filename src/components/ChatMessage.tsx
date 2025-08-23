"use client"

import { useAuth } from "@/hooks/auth-context"
import { db } from "@/lib/firebase"
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore"
import { CircleAlert } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { 
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem
  } from "./ui/dropdown-menu"
import { toast } from "sonner"
import { useRoomContext } from "@/hooks/room-context"
import { format } from 'date-fns'



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

  //scrollintoview
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
   bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[messages])

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
    <div className={`bg-gray-300 dark:bg-gray-600 h-[400px] border-r-2 border-l-2 rounded-b-sm overflow-y-auto scrollbar-hide`}>
      {
        messages.length === 0 ? (
          <div className="flex justify-center items-center h-[400px] text-white">Start chat</div>

        ) :(
         messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex overflow-y-auto px-1 py-1 ${
              msg.sender_email === 'system' ?'justify-center':
              msg.sender_email === owner?'justify-end':'justify-start'
            }`}
          >
            <div 
               className={`max-w-sm flex rounded py-1 px-3
               ${ msg?.sender_email === 'system' ?`
               ${user?.email !== msg?.email && 'bg-gray-500 text-sm italic opacity-50 text-white'}`:
                  msg?.sender_email === owner? ' dark:text-black text-white':'text-black'
                }
               `}>
                {
                  msg?.sender_email ==='system' ? (
                    user?.email !== msg?.email ? (
                      <span className="text-xs">{msg?.chat}</span>
                    ):(
                      messages.length < 2 &&
                      <span className="h-56 flex justify-center items-center">Start conversation!</span>
                    )
                  ):(
                    <div className={`flex gap-2`}>
                      <div className="shrink-0 w-6 h-6 relative">
                       <Image 
                          src={msg?.photo_url!} 
                          className="rounded-full object-center" 
                          fill 
                          alt=""/>
                      </div>
                    <div className={`rounded-bl-xl rounded-tr-xl
                        ${msg?.sender_email === owner? 'bg-sky-400':'bg-base-100 text-black'}
                        `}>
                        <div className="grid">
                           <div className="flex rounded-tr-xl text-xs items-center text-gray-400 justify-between gap-6 py-1 px-2 bg-gray-200">
                              <p>{msg?.sender? msg.sender:<span className="loading loading-dots loading-sm"></span>}</p>
                               <span className="justify-self-end text-xs text-gray-400">
                                  { msg?.date ? format(msg?.date?.toDate(), "do MMM HH:mm a"):"now"}
                                </span>
                           </div>
                          <p className="py-1 px-2">{msg?.chat}</p>
                        </div>
                    </div>
                        {
                          user?.email === msg.sender_email && (
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <CircleAlert className="w-4 h-4 shrink-0 text-gray-600 dark:text-white cursor-pointer" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="cursor-pointer" onClick={() =>deleteChat(roomId, msg.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        }
                    </div>
                  )
                }
            </div>
          </div>
         ))
        )
      }
      <div ref={bottomRef} className="py-1"></div> 
    </div>
  )
}

export default ChatMessage