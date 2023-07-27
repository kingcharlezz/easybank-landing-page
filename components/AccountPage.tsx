import React, { useEffect, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { doc, getFirestore, getDoc, setDoc } from 'firebase/firestore';

interface AccountPageProps {
  darkMode: boolean;
}

interface accountinfo {
  email: string;
  displayName: string;
  paymentTier: string;
}

const AccountPage: React.FC<AccountPageProps> = ({ darkMode }) => {
  const [accountinfo, setaccountinfo] = useState<accountinfo | null>(null);

  const createaccountinfoDocument = async (uid: string, email: string, paymentTier: string) => {
    const db = getFirestore();
    const userDoc = doc(db, 'users', uid);
    const accountinfoDoc = doc(userDoc, 'accountinfo', 'info');

    await setDoc(accountinfoDoc, {
      email,
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
      const accountinfoDoc = doc(userDoc, 'accountinfo', 'info');
      
      getDoc(accountinfoDoc).then((accountinfoSnapshot) => {
        if (accountinfoSnapshot.exists()) {
          setaccountinfo(accountinfoSnapshot.data() as accountinfo);
        } else {
          console.log("No account info found");
          // Creating the accountinfo document for the first time if it doesn't exist.
          createaccountinfoDocument(user.uid, user.email || '' , 'Free');
        }
      }).catch((error: any) => {
        console.log('Error getting document:', error);
      });      
    } else {
      console.log("No user is signed in.");
    }
  }, [darkMode]);

  if (accountinfo) {
    return (
      <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} px-4 py-6`}>
        <div className={`p-4 flex flex-wrap justify-between items-center rounded shadow-md ${darkMode ? 'bg-darker-blue text-neutral-white' : 'bg-white text-gray-900'} text-2xl`}>
          <div style={{maxWidth: '80%'}}>
            <div className="flex flex-col text-left">
              <div className="text-2xl text-left truncate">Email: {accountinfo.email}</div>
    
              <div className="text-xl text-left">Payment Tier: {accountinfo.paymentTier}</div>
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