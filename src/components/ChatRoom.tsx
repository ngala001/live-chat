"use client"
import { auth, db, realDb } from '@/lib/firebase'
import { addDoc, collection, doc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { FormEvent, useEffect, useState} from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import ChatMessage from './ChatMessage'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'
import { useRoomContext } from '@/hooks/room-context'
import { onValue, ref, update, serverTimestamp as rtdTimestamp } from 'firebase/database'
import { leaveRoom, userStatus } from '@/lib/room-actions'
import { useCreateRoomStore } from '@/store/create-roomStore'
import { debounce } from 'lodash'
import { MoreHorizontal, Route, Settings2, Users } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import Participants from './Participants'

type Member = {
    username: string;
    email: string
}

type UsersType = {
        id: string
        username: string,
        online: boolean,
        typing?: boolean,
        last_seen?: number
    }

export type RoomType = {
    id?: string;
    name?: string,
    created_at?: Timestamp,
    creator?: string,
    members?: Member[]
}

const pple =[
  {
    id: "e1223sge"!,
    online: true,
    name: "alex"
},
  {
    id: "e1245syr"!,
    online: false,
    name: "Okumu"
},
] 


const ChatRoom = ({roomId}:{roomId: string}) => {
    const [chat, setChat ] = useState("")
    const [sending, setSending ] = useState(false)
    const [users, setUsers] = useState<UsersType[]>([])
    const [typingUsers, setTypingUsers ] = useState<string[]>([])
    const [onlineUsers, setOnlineUsers ] = useState<string[]>([])
    const [chatSender, setChatSender ] = useState('')
    const [open, setOpen ] = useState(false)
    

    const {user} = useAuth()
    const router = useRouter()
    const {room, getRoom} = useRoomContext()
    const {username} = useCreateRoomStore()
    
 
    useEffect(() => {
      getRoom(roomId)

    },[]);

//memembers

useEffect(() => {
    if(room?.members && user?.email) {
        const member = room.members?.find((mb) => mb.email === user?.email)
        if(member?.username) {
            setChatSender(member?.username!)
        }
    }
},[room?.members, user?.email])

 //set istyping..
 useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(realDb, `presence/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() || {};
      const usersTyping = Object.entries<any>(data)
        .filter(([uid, u]) => u?.typing && uid !== user?.uid)
        .map(([_, u]) => u.username);

      setTypingUsers(usersTyping || user?.email);
    });

    return () => unsubscribe();
  }, [roomId, user?.uid]);

    //user status listener
    useEffect(() => {
        const userRef = ref(realDb,`presence/${roomId}`)

        const unsubscribe = onValue(userRef, (snapshot) => {
        const users = snapshot.val() || {};

        const usersArray = Object.entries(users).map(([uid, info]: any) => ({
            id: uid,
            ...info
        }))
          setUsers(usersArray)
        });

        //reconects on refresh
        const connectedRef = ref(realDb, ".info/connected");
        const connListener = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            // Mark user online again after reconnect
            userStatus(roomId, user?.uid!, username);
        }
        });

        return () => {
            unsubscribe()
            connListener()
        }
    },[roomId])
//handle typing
   const userRef = ref(realDb,`presence/${roomId}/${user?.uid}`)

    const stopTyping = debounce(() => {
     update(userRef, {
       typing: false,
       last_seen: rtdTimestamp()
     })
    },5000)

    const handleTyping = () => {
       update(userRef, {
       typing: true,
       last_seen: rtdTimestamp()
     });
     stopTyping()
    }
    


//handle message sent
    const sendMessage = async(e: FormEvent) => {
        e.preventDefault();
        setSending(true)

        if(!chat.trim()) {
            toast.error("Please type a message")
            return
        }

        try {
            await addDoc(collection(db,`rooms/${roomId}/messages`), {
                chat,
                sender_email: user?.email,
                photo_url: user?.photoURL || "https://avatar.iran.liara.run/public",
                date: serverTimestamp(),
                sender: chatSender
            })

            setChat("")
            update(userRef, {
                typing: false,
                last_seen: rtdTimestamp()
            })
            stopTyping.cancel()

        } catch (error) {
            console.log(error)
            if(error instanceof Error){
                toast.error(error?.message)
            } else {
                toast.error("Send failed!")
            }
        } finally {
            setSending(false)
        }
    }

    const quiteRoom = async() => {
      try {
        await leaveRoom(roomId, user?.uid!, user?.email!)
        toast.success(`Your successfully left ${room?.name} room`)
        router.push('/')
      } catch (error) {
        if(error instanceof Error) {
            toast.error(error.message)
            return
        }else {
            toast.error("Error occured while leaving the room")
        }
      }
    }



   
  return (
    <main className='md:max-w-3xl px-2 relative mx-auto'>

        <div className=''>
            <div className='flex items-center border-t-2 border-r-2 border-l-2 z-50 justify-between py-3 px-4 rounded-t-lg shadow-sm'>
                <div>
                    <h1 className='font-semibold text-2xl'>
                        { room?.name ? room?.name?.charAt(0).toUpperCase() + room?.name?.slice(1)! :""}
                    </h1>
                </div>
                <div>
                    {
                        typingUsers.length > 0 && (
                            <span className="text-sm text-gray-500 dark:text-white">
                                {[...new Set(typingUsers.filter(Boolean))].join(",")}{" "} {typingUsers.length > 1 ? "are" : "is"} typing...
                            </span>
                        )
                    }
                </div>
                <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div 
                         className='border p-1 cursor-pointer flex items-center rounded-full justify-between dark:border-white border-gray-500'>
                        <MoreHorizontal className='w-4 h-4 font-bold'/>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => setOpen(true)}
                         className='cursor-pointer'>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                    <Users />
                                    <span className="flex items-center gap-1">
                                        Participants
                                        <Badge variant="default" className="ml-1 h-5 w-5 rounded-full">
                                         {users.length}
                                        </Badge>
                                    </span>
                                    </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                           onClick={quiteRoom}
                           className='cursor-pointer'>
                            <Route/>
                            Leave room
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                         className='cursor-pointer'>
                            <Settings2/>
                            Room settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>

                    </DropdownMenu>

                    
                </div>
            </div>
            {/* MESSAGES SECTION PANEL */}
            <ChatMessage roomId={roomId}/>
        </div>

        <form onSubmit={sendMessage}>
            <div className='flex mt-2 gap-2'>
                <Input 
                className='w-[90%] px-2' 
                value={chat} 
                onChange={(e) => {
                    setChat(e.target.value)
                    handleTyping()
                }}  
                placeholder='Type your message here..'/>

                <Button 
                className='cursor-pointer disabled:cursor-not-allowed disabled:opacity-35' 
                disabled={!chat.trim()}
                >
                    {
                        !sending ? "send" : (
                            <span>
                                <span className='loading loading-dots'></span>
                            </span>
                        )

                    }
                </Button>
            </div>
        </form>

        <Participants participants={users} open={open} setOpen={setOpen}/>
    </main>
  )
}

export default ChatRoom