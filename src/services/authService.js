import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const register = async (username, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: username })
  return userCredential.user
}

export const logout = async () => {
  await signOut(auth)
}

export const getToken = async () => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken()
  }
  return null
}

export const isAuthenticated = () => !!auth.currentUser
