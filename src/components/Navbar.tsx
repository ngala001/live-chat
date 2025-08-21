'use client'
import { useAuth } from "@/hooks/auth-context"
import { ChevronDown, LogOut, Moon, Settings, Sun, User } from "lucide-react"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const Navbar = () => {
    const { user } = useAuth()
    const { setTheme } = useTheme()

    const router = useRouter()

    const logOut =() => {
        signOut(auth)
        router.push('/auth/login')
    }
  return (
    <div>
        <header className="shadow overflow-hidden">
                <nav className="flex items-center justify-between px-5 py-4 container mx-auto">
                    <h1 className="text-2xl font-bold">
                        <span className="text-red-500 text-3xl">C</span>onnectify<span className="text-red-500 text-3xl">.</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="sm:flex items-center gap-1 hidden ">
                            <span>{user?.email}</span>
                            <ChevronDown className="w-4 h-4 mt-2"/>
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                            </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                                Light
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                                Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                                System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                        <DropdownMenuTrigger className='cursor-pointer outline-0'>
                            <Avatar>
                                <AvatarImage src={user?.photoURL!}/>
                                <AvatarFallback></AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Account</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className='cursor-pointer'>
                                <User/>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className='cursor-pointer'>
                                <Settings/>
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className='cursor-pointer' 
                                variant='destructive'
                                onClick={logOut}
                            >
                                    <LogOut/>
                                    LogOut
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </nav>
            </header>
    </div>
  )
}

export default Navbar