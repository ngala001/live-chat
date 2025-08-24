"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";

type Participant = {
  id: string;
  username: string;
  online: boolean;
}


const Participants = ({
    participants,
    open,
    setOpen
}: {
    participants: Participant[],
    open: boolean,
    setOpen:(v:boolean) => void
}) => {
    const [activeTab, setActiveTab] = useState<"all" | "online">("all");

  const allParticipants = participants;
  const onlineParticipants = participants.filter(p => p.online);
  return (  
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Participants View</DialogTitle>
            </DialogHeader>
                <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                    className={`flex-1 py-2 cursor-pointer font-semibold ${
                        activeTab === "all" ? "bg-gray-100 dark:bg-black" : ""
                    }`}
                    onClick={() => setActiveTab("all")}
                    >
                    Participants
                    </button>
                    <button
                    className={`flex-1 cursor-pointer py-2 font-semibold ${
                        activeTab === "online" ? "bg-gray-100 dark:bg-black" : ""
                    }`}
                    onClick={() => setActiveTab("online")}
                    >
                    Active / Online
                    </button>
                </div>

                <div className="mt-3 px-3 max-h-64 overflow-y-auto">
                    {(activeTab === "all" ? participants : onlineParticipants).map((p) => (
                        <div key={p.id} className="py-2 border-b last:border-0">
                        {p.username}{" "}
                        {p.online && <span className="text-green-500">(Online)</span>}
                        </div>
                    ))}

                    {activeTab === "online" && onlineParticipants.length === 0 && (
                        <p className="text-gray-500">No one is online.</p>
                    )}
                 </div>
                </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"outline"}>Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>

    </Dialog>   
  )
}

export default Participants