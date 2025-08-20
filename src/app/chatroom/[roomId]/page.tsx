import ChatRoom from '@/components/ChatRoom'
import React from 'react'

const ChatBox = async({params}:{params: Promise<{roomId: string}>}) => {

    const {roomId } = await params
  return (
    <div className='mt-7'>
       <ChatRoom roomId={roomId}/>
    </div>
  )
}

export default ChatBox