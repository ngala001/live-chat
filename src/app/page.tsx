import ChatRoom from "@/components/ChatRoom";
import CreateRoom from "@/components/CreateRoom";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center">
       <CreateRoom/>
    </div>
  );
}
