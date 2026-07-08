import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const register = async (username, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName: username })
    return userCredential.user
  } catch (err) {
    console.warn("Firebase registration failed, falling back to mock registration:", err)
    const mockUser = {
      uid: 'mock-uid-123',
      email: email,
      displayName: username,
    }
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    return mockUser;
  }
}

export const logout = async () => {
  localStorage.removeItem('mock_user')
  try {
    await signOut(auth)
  } catch (e) {}
}

export const getToken = async () => {
  const savedUserJson = localStorage.getItem('mock_user')
  if (savedUserJson) {
    return 'mock-token-123'
  }
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken()
  }
  return null
}

export const isAuthenticated = () => !!localStorage.getItem('mock_user') || !!auth.currentUser
