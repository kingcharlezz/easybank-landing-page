import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import {signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV6SBt7Ptnar-2ClKvlH1qyiMjb9i0r5w",
  authDomain: "notescribe-6867a.firebaseapp.com",
  projectId: "notescribe-6867a",
  storageBucket: "notescribe-6867a.appspot.com",
  messagingSenderId: "38833832302",
  appId: "1:38833832302:web:41385c0a187cfd86a0017f",
  measurementId: "G-7LSM15R6NS"
};

const provider = new GoogleAuthProvider();

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User registered successfully!');
    } catch (error) {
      alert(error.message);
    }
  }

  const logIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully!');
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={logIn}>Log In</button>
    </div>
  );
};

export { auth };
