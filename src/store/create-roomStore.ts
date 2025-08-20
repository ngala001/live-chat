import { create } from "zustand";

interface Room {
    username: string,
    roomName: string
    setUsername: (username: string) => void,
    setRoomName: (roomName: string) => void
}

export const useCreateRoomStore = create<Room>((set) =>({
    username: '',
    roomName:'',
    setUsername: (name) => set({username: name}),
    setRoomName: (name) => set({roomName: name})
}))