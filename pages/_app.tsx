import React, { ReactNode, useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "../components/auth"
import { useRouter } from 'next/router';
import '../styles/tailwind.css';

export const UserContext = React.createContext<User | null>(null);


export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in
        setUser(currentUser);
        if (router.pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        // User is signed out
        setUser(null);
        if (router.pathname === '/dashboard') {
          router.push('/login');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}