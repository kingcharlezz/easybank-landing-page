import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../components/layout/firebase';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';

// Initialize a Google Auth Provider
const provider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Get the Next.js router instance
  const router = useRouter();

  const logIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // After successful login, redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const googleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      // After successful login, redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const resetPassword = async () => {
    if (email === '') {
      alert('Please enter your email first.');
    } else {
      try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-white text-primary-black">
      <Navbar />
      <div className="flex flex-col space-y-6 w-80 mt-20 mb-10">
        <h1 className="text-3xl font-bold">Login</h1>

        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          className="p-3 bg-neutral-very-light-gray text-primary-black rounded"
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          className="p-3 bg-neutral-very-light-gray text-primary-black rounded"
        />

        <div onClick={resetPassword} className="text-center text-primary-black underline cursor-pointer">
          Reset Password
        </div>

        <button 
          onClick={logIn} 
          className="p-3 bg-primary-lime-green text-neutral-black rounded"
        >
          Login
        </button>

        <button 
          onClick={googleSignIn} 
          className="p-3 bg-primary-dark-blue text-neutral-white rounded"
        >
          Login with Google
        </button>

        <Link href="/signup">
          <a className="text-center underline">Don't have an account? Sign up</a>
        </Link>
      </div>
    </div>
  );
}
