
import { 
     addDoc, 
     arrayRemove, 
     arrayUnion, 
     collection,
     doc,
     getDoc,
     getDocs, 
     query, 
     serverTimestamp,
     Timestamp,
     updateDoc, 
     where 
} from "firebase/firestore"

import { db, realDb } from "./firebase"
import { RoomType } from "@/components/ChatRoom";
import { onDisconnect, ref, set,  serverTimestamp as rtdbTimestamp, remove } from "firebase/database";

type ChatType = {
    chat: string
    sender_email: string
    date: Timestamp,
    email?: string
}

//realtime database setup

export const userStatus = (roomId: string, userId: string, username: string) => {
  const statusRef = ref(realDb, `presence/${roomId}/${userId}`);

   set(statusRef, {
     username: username,
     online: true,
     last_seen: rtdbTimestamp(),
     typing: false
   });

   onDisconnect(statusRef).set({
     username: username,
     online: false,
     last_seen: rtdbTimestamp(),
     typing: false
   })
}

export const leaveRoom = async(roomId: string, userId: string, email: string) => {
  const statusRef = ref(realDb, `presence/${roomId}/${userId}`);
  const roomDoc = doc(db,'rooms', roomId)
  const chatRef = collection(db,`rooms/${roomId}/messages`)
  //remove presence
  await remove(statusRef);
  //remove from members/participants
  const room = await getDoc(roomDoc)
  if(!room.exists()) {
    throw new Error("No room to be exited")
  }

  const members = room.data()?.members || [];

  const exitingMember = members.find((member:{username: string, email: string}) => member.email === email)

  if(!exitingMember){
   throw new Error("Member not found")
  }

 await updateDoc(roomDoc, {
  members: arrayRemove(exitingMember)
 })

 await addDoc(chatRef, {
  chat:`${exitingMember.username} left room`,
  sender_email:"system",
  date: serverTimestamp(),
  email: exitingMember.email
 })
   
};


export const joinOrCreateRoom = async(roomName: string, username: string, email:string) => {
    const roomRef = collection(db,'rooms')
    const q = query(roomRef, where("name", "==", roomName.trim().toLowerCase()));

    const snapshot = await getDocs(q);

    if(!snapshot.empty) {
        const existingRoom = snapshot.docs[0]
        const docRef = doc(db,'rooms', existingRoom.id)

        const alreadyJoined = existingRoom.data()?.members?.find((member:{username:string, email: string}) => 
            member.email.toLowerCase() === email.toLowerCase()
        );

        if(!alreadyJoined) {

            await updateDoc(docRef, {
                members: arrayUnion({
                    username:username,
                    email: email.toLowerCase()
                })
            });
            
            await addDoc(collection(db,`rooms/${existingRoom.id}/messages`),{
              chat: `${username} joined room`,
              sender_email:'system',
              date: serverTimestamp(),
              type:'joined',
              email: email,
              sender: username
            })
          } else if(alreadyJoined.username.toLowerCase() !== username.toLowerCase() && alreadyJoined.email.toLowerCase() === email.toLowerCase()){

            throw new Error("This email is already registered with a different username!")
          }


          return { 
              room: {id: existingRoom.id, ...existingRoom.data() as RoomType}, 
              isNew: false
          }
        


    }

    const newRoom = await addDoc(roomRef, {
        name: roomName.trim().toLowerCase(),
        created_at: serverTimestamp(),
        creator: username,
        email: email,
        members:[{username,email}]
    })

    await addDoc(collection(db,`rooms/${newRoom.id}/messages`),{
          chat: `${username } created room`,
          sender_email:'system',
          date: serverTimestamp(),
          type:'created',
          email: email,
          sender: username
        })

    return { 
        room: {id: newRoom.id, name: roomName, created_at: serverTimestamp() as RoomType}, 
        isNew: true
    }


}

