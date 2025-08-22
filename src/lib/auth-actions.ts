import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "./firebase"

export const login = async(email: string, password: string) => {
  await signInWithEmailAndPassword(auth,email,password)
}