import React, { useEffect, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { doc, getFirestore, getDoc, setDoc } from 'firebase/firestore';

interface AccountPageProps {
  darkMode: boolean;
}

interface AccountInfo {
  email: string;
  displayName: string;
  paymentTier: string;
}

const AccountPage: React.FC<AccountPageProps> = ({ darkMode }) => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

  const createAccountInfoDocument = async (uid: string, email: string, displayName: string, paymentTier: string) => {
    const db = getFirestore();
    const userDoc = doc(db, 'users', uid);
    const accountInfoDoc = doc(userDoc, 'accountInfo', 'info');

    await setDoc(accountInfoDoc, {
      email,
      displayName,
      paymentTier,
    });
  }

  useEffect(() => {
    document.body.className = darkMode ? 'body-dark' : 'body-light';
    
    const auth = getAuth();
    const user: User | null = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, 'users', user.uid);
      const accountInfoDoc = doc(userDoc, 'accountInfo', 'info');
      
      getDoc(accountInfoDoc).then((accountInfoSnapshot) => {
        if (accountInfoSnapshot.exists()) {
          setAccountInfo(accountInfoSnapshot.data() as AccountInfo);
        } else {
          console.log("No account info found");
          // Creating the accountInfo document for the first time if it doesn't exist.
          createAccountInfoDocument(user.uid, user.email || '', user.displayName || '', 'Free');
        }
      }).catch((error: any) => {
        console.log('Error getting document:', error);
      });      
    } else {
      console.log("No user is signed in.");
    }
  }, [darkMode]);

  if (accountInfo) {
    return (
      <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} px-4 py-6`}>
        <div className={`p-4 flex flex-wrap justify-between items-center rounded shadow-md ${darkMode ? 'bg-darker-blue text-neutral-white' : 'bg-white text-gray-900'} text-2xl`}>
          <div style={{maxWidth: '80%'}}>
            <div className="flex flex-col text-left">
              <div className="text-2xl text-left truncate">Email: {accountInfo.email}</div>
              <div className="text-xl text-left">Display Name: {accountInfo.displayName}</div>
              <div className="text-xl text-left">Payment Tier: {accountInfo.paymentTier}</div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} px-4 py-6`}>
        <h1 className={`mt-12 text-4xl font-bold tracking-tight ${darkMode ? 'text-neutral-white' : 'text-gray-900'} sm:mt-10 sm:text-6xl`}>Loading...</h1>
      </div>
    );
  }
}

export default AccountPage;