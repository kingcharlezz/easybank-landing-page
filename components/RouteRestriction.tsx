import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, } from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();

type PaymentTierType = "Premium" | "PremiumPlus";

// Define the maximum route usage for each payment tier
const MAX_API_USAGE: Record<PaymentTierType, Record<string, number>> = {
  "Premium": { "summary": 50, "fileSummary": 20 },
  "PremiumPlus": { "summary": 200, "fileSummary": 50}
}


export function withRouteRestriction(WrappedComponent: React.ComponentType<any>, apiName: string) {
  return (props: any) => {
    const [loading, setLoading] = useState(true);
    const [overLimit, setOverLimit] = useState(false);

    useEffect(() => {
      async function checkApiUsage() {
        const user = auth.currentUser;

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const apiCounts = userData.apiCounts || {};
            const accountInfoRef = doc(db, "accountinfo", user.uid);
            const accountInfoDoc = await getDoc(accountInfoRef);
            
            if (accountInfoDoc.exists()) {
              const accountInfoData = accountInfoDoc.data();
              const subscriptionStatus = accountInfoData.subscriptionStatus;
              const paymentTier = accountInfoData.paymentTier as PaymentTierType;

              // If the user has an active subscription and their API count for the specified route is over the maximum, set overLimit to true
              if (subscriptionStatus === "active" && apiCounts[apiName] >= MAX_API_USAGE[paymentTier][apiName]) {
                setOverLimit(true);
              }
            }
          }
          setLoading(false);
        }
      }
      
      checkApiUsage();
    }, []);

    // Render a loading screen while checking the user's API count and payment tier
    if (loading) {
      return <div>Loading...</div>;
    }

    // Render the wrapped component, passing overLimit as a prop
    return <WrappedComponent {...props} overLimit={overLimit} />;
  };
}
