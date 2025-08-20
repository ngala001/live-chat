
import { 
     addDoc, 
     arrayUnion, 
     collection,
     doc,
     getDocs, 
     query, 
     serverTimestamp,
     updateDoc, 
     where 
} from "firebase/firestore"
import { db, realDb } from "./firebase"
import { RoomType } from "@/components/ChatRoom";
import { onDisconnect, ref, set,  serverTimestamp as rtdbTimestamp } from "firebase/database";

//realtime database setup

export const userStatus = (roomId: string, userId: string, username: string) => {
  const statusRef = ref(realDb, `presence/${roomId}/${userId}`);

   set(statusRef, {
     username: username.charAt(0).toUpperCase() + username.slice(1),
     online: true,
     last_seen: rtdbTimestamp(),
     typing: false
   });

   onDisconnect(statusRef).set({
     username: username.charAt(0).toUpperCase() + username.slice(1),
     online: false,
     last_seen: rtdbTimestamp(),
     typing: false
   })
}

export const leaveRoom = (roomId: string, userId: string, username: string) => {
  const statusRef = ref(realDb, `presence/${roomId}/${userId}`);

  set(statusRef, {
    username,
    online: false,
    last_seen: serverTimestamp(),
    typing: false,
  });
};


export const joinOrCreateRoom = async(roomName: string, username: string, email:string) => {
    const roomRef = collection(db,'rooms')
    const q = query(roomRef, where("name", "==", roomName.trim().toLowerCase()));

    const snapshot = await getDocs(q);

    if(!snapshot.empty) {
        const existingRoom = snapshot.docs[0]
        const docRef = doc(db,'rooms', existingRoom.id)

        const alreadyJoined = existingRoom.data()?.members?.some((member:{username:string, email: string}) => 
           member.username.toLowerCase() === username.toLowerCase() || member.email.toLowerCase() === email.toLowerCase()
        );

        if(!alreadyJoined) {

            await updateDoc(docRef, {
                members: arrayUnion({
                    username:username.toLowerCase(),
                    email: email.toLowerCase()
                })
            });
        }
        

        await addDoc(collection(db,`rooms/${existingRoom.id}/messages`),{
          chat: `${username.charAt(0).toUpperCase() + username.slice(1)} joined room`,
          sender_email:'system',
          date: serverTimestamp(),
          type:'joined',
          email: email,
          sender: username.toLowerCase()
        })

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
          chat: `${username.charAt(0).toUpperCase() + username.slice(1)} created room`,
          sender_email:'system',
          date: serverTimestamp(),
          type:'created',
          email: email,
          sender: username.toLowerCase()
        })

    return { 
        room: {id: newRoom.id, name: roomName, created_at: serverTimestamp() as RoomType}, 
        isNew: true
    }


}

