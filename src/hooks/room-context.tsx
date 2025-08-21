"use client"

import { RoomType } from "@/components/ChatRoom"
import { db } from "@/lib/firebase"
import { collection, doc, getDoc} from "firebase/firestore"
import { createContext, useContext, useState } from "react"
import { toast } from "sonner"

type RoomContextType = {
  room: RoomType;
  getRoom: (roomId: string) => Promise<void>
}

type RoomMembers = {
  username: string,
  email: string
}

const RoomContext = createContext<RoomContextType | null>(null)

export default function RoomProvider({children}:{children:React.ReactNode}) {
    const [room, setRoom ] = useState<RoomType>({})
    const [members, setMembers] = useState<RoomMembers[]>([])

     const getRoom = async(roomId: string) => {
        const docRef = doc(db,'rooms', roomId)
        const foundRoom = await getDoc(docRef)

        if(foundRoom.exists()){
            setRoom({id: foundRoom.id, ...foundRoom.data()})
        } else {
            toast.error("No room found")
        }
           
    }

    return (
      <RoomContext.Provider value={{ room, getRoom }}>
        {children}
      </RoomContext.Provider>
    )
}

export const useRoomContext = () => {
 const context = useContext(RoomContext);
 if(!context) {
    throw new Error("roomContext can only be used within RoomProvider hook")
 }
 return context;
}