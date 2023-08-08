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
  const auth = getAuth();

  const createAccountInfoDocument = async (uid: string, email: string, paymentTier: string) => {
    console.log(`Creating account info document for uid: ${uid}, email: ${email}`);  // Check if function is being called and log values
  
    try {
      const db = getFirestore();
      const userDoc = doc(db, 'users', uid);
      const accountInfoDoc = doc(userDoc, 'accountinfo', 'info');
  
      await setDoc(accountInfoDoc, {
        email,
        paymentTier,
      });
  
      // Set the state with the new account info after creating it
      setAccountInfo({
        email: email || '',
        displayName: auth.currentUser?.displayName || '',
        paymentTier: paymentTier || '',
      });
  
      console.log('Account info document created successfully');
    } catch (error) {
      console.error('Error creating account info document:', error);  // Catch and log any errors
    }
  };
  

  const goToStripePortal = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      console.error('No user is signed in.');
      return;
    }
    try {
      const response = await fetch('/api/stripe-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error accessing Stripe Customer Portal:', error);
    }
  };

  useEffect(() => {
    document.body.className = darkMode ? 'body-dark' : 'body-light';
    const user: User | null = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, 'users', user.uid);
      const accountInfoDoc = doc(userDoc, 'accountinfo', 'info');
      
      getDoc(accountInfoDoc).then((accountInfoSnapshot) => {
        if (accountInfoSnapshot.exists()) {
          setAccountInfo(accountInfoSnapshot.data() as AccountInfo);
        } else {
          console.log("No account info found");
          createAccountInfoDocument(user.uid, user.email || '', 'Free');
        }
      }).catch((error: any) => {
        console.log('Error getting document:', error);
      });
    } else {
      console.log("No user is signed in.");
    }
  }, [darkMode]);

  return (
    <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} p-4`}>
      {accountInfo ? (
        <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-dark-blue text-neutral-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-3xl font-bold mb-4">Account Details</h2>
          <div className="mb-6">
            <span className="font-medium">Payment Tier:</span> {accountInfo.paymentTier}
          </div>
          <button 
            onClick={() => goToStripePortal()}   
            className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${darkMode ? 'shadow-md' : ''}`}
          >
            Go to Stripe Portal
          </button>
        </div>
      ) : (
        <div className={`flex justify-center items-center h-60 ${darkMode ? 'bg-darker-blue' : 'bg-white'}`}>
          <div className={`spinner ${darkMode ? 'text-neutral-white' : 'text-gray-900'}`}></div>
        </div>
      )}
      <style jsx>{`
        .spinner {
          border: 5px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AccountPage;
