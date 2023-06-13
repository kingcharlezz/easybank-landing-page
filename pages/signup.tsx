import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../components/layout/firebase';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';

// Initialize a Google Auth Provider
const provider = new GoogleAuthProvider();

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User registered successfully!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const googleSignUp = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert('Registered successfully with Google!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-white text-primary-black">
      <Navbar />
      <div className="flex flex-col space-y-6 w-80 mt-20 mb-10">
      <h1 className="text-3xl font-bold text-center">Sign up</h1>

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

        <button 
          onClick={signUp} 
          className="p-3 bg-primary-lime-green text-neutral-black rounded"
        >
          Sign up
        </button>

        <button 
          onClick={googleSignUp} 
          className="p-3 bg-primary-dark-blue text-neutral-white rounded"
        >
          Sign up with Google
        </button>

        <Link href="/login">
            <span className="text-center-underline">Already have an account? Login</span>
        </Link>
      </div>
    </div>
  );
}
