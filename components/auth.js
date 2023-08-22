import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import {signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { getFirestore } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const auth = getAuth();
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Access uid through user property of userCredential
      const uid = userCredential.user.uid;
      // Create a document in Firestore with the user's uid
      await setDoc(doc(db, 'users', uid), { email: email });
    } catch (error) {
      alert(error.message);
    }
  }
  
  const logIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "https://www.notescribe.ai/dashboard";
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
