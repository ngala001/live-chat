"use client"
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth"
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react"

type AuthType = {
    user: User | null;
    loading: boolean
}

const AuthContext = createContext<AuthType | null>(null)

export default function AuthProvider({children}:{children:React.ReactNode}) {
    const [user, setUser ] = useState<User | null>(null)
    const [loading, setLoading ] = useState(true)

    const router = useRouter()
    
    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
       });

       return () => unsubscribe()
       
    },[])

   useEffect(() => {
     if(!user && !loading){
        router.replace('/auth/login')
     }
   },[loading, user, router])

   if(loading) {
     return (
        <div className="flex h-screen flex-col items-center justify-center">
            <p>
              <span className="loading loading-ring loading-xs"></span>
              <span className="loading loading-ring loading-sm"></span>
              <span className="loading loading-ring loading-md"></span>
              <span className="loading loading-ring loading-lg"></span>
              <span className="loading loading-ring loading-xl"></span>
            </p>
            <p>Verifying access ...</p>
        </div>
     )
   }

    return (
       <AuthContext.Provider value={{ user, loading }}>
         {children}
       </AuthContext.Provider>
    )
}

export const useAuth =() => {
   const context = useContext(AuthContext);
   if(!context) {
     throw new Error("Auth context can only be used within AuthProvider")
   }

   return context
}