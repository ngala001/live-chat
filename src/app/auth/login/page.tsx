"use client"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/auth-context'
import { auth } from '@/lib/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Login = () => {
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')

    const router = useRouter()

    const LoginInWithGoogle = () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
        router.push('/')
    }

  return (
    <form className='max-w-sm mx-auto mt-10 py-4 px-10 shadow grid gap-4' >
         <h1 className='border-b-2 pb-2 border-gray-500 font-bold text-2xl'>Login</h1>
        <div className='grid gap-4 mt-4'>
            <Label>Email Address</Label>
            <Input
                type='email' 
                placeholder='example@gmail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
        </div>

        <div className='grid gap-4 mt-4'>
            <Label>Password</Label>
            <Input
                type='password' 
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <div className='text-center mt-2'>
            <button className='btn px-12 btn-primary'>Login</button>
        </div>
        <div className='divider'>Or</div>
        <div className='text-center'>
            <button type='button' onClick={LoginInWithGoogle} className="btn bg-white text-black border-[#e5e5e5]">
            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
             Login with Google
            </button>
        </div>
    </form>
  )
}

export default Login