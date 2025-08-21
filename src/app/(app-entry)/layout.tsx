import Navbar from "@/components/Navbar";


export default function AppLayout({children}:{children: React.ReactNode}){
    return (  
         <div className="h-screen">
            <Navbar/>
            {children}
        </div>
    )
}