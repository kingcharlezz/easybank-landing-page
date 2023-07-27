import { useEffect, useState } from 'react';
import { getFirestore, setDoc, doc, collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;

type subscription = {
    paymentTier?: string;
    price?: unknown; // Ideally this would be a more specific type
  } | null; 

export function PricingPage() {
  // State for the user's subscription
  const [subscription, setSubscription] = useState<subscription>(null);

  useEffect(() => {
    if (!user?.uid) {
      console.warn('User or user UID not defined. Not starting subscription listener.');
      return;
    }

    const unsubscribe = onSnapshot(
        query(
          collection(db, "customers", user.uid, "users_plan"),
          where("status", "in", [null, "price_1NXToIBvnwuagBF3uzoMAy42", "price_1NXToqBvnwuagBF3dcsPonUg"])
        ),
        async (snapshot) => {
          if (snapshot.empty) {
            setSubscription(null);
            return;
          }
  
          // In this implementation, we only expect one Subscription to exist
          const subscriptionData = snapshot.docs[0].data();
          const priceDoc = await getDoc(subscriptionData.price);
          const priceData = priceDoc.data();
  
          let paymentTier;
          if (subscriptionData.status === "price_1NXToIBvnwuagBF3uzoMAy42") {
            paymentTier = "premium";
          } else if (subscriptionData.status === "price_1NXToqBvnwuagBF3dcsPonUg") {
            paymentTier = "premiumPlus";
          }
  
          if (paymentTier) {
            await setDoc(doc(db, "users", user.uid, "accountinfo", "info"), {
              paymentTier: paymentTier
            }, { merge: true });
          }
  
          setSubscription({
            price: priceData,
            ...subscriptionData,
            paymentTier: paymentTier
          });
        }
      );

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);
}