import { FC, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getFirestore, collection, where, getDocs, query } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

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


interface Product {
  name: string;
  price: number;
  priceId: string;
}
interface MyComponentProps {
  darkMode: boolean;
}

const PricingPage: React.FC<MyComponentProps> = ({ darkMode }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      name: 'Premium Plan',
      price: 500,
      priceId: 'price_1NhLGpBvnwuagBF3xx2ahf2c',
    },
    {
      name: 'PremiumPlus Plan',
      price: 1000,
      priceId: 'price_1NhLGlBvnwuagBF3i32XHWs4',
    },
    // Add more plans as needed
  ]);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({}); // Add loading state for each product
  const stripePromise = loadStripe('pk_live_51NWlFcBvnwuagBF39DAb6XZoiMJrlPFpDUj4YQIva26qWTJU1bnoaCq7tcI6iKQ7O9NJWHx1YRw8QJxx5inPQw7M007OzH5hhc');

  // Define a mapping of product names to features
  const productFeatures: { [key: string]: string[] } = {
    'Free Plan': ['10 Youtube Videos Notes Per Month', '3 Uploaded Files Notes Per Month', 'No Access to AI Humanizer(Coming Soon)'],
    'Premium Plan': ['50 Youtube Videos Notes Per Month', '20 Uploaded Files Notes Per Month', 'Access to AI Humanizer  (Coming Soon)'],
    'PremiumPlus Plan': ['200 Youtube Videos Notes Per Month', '50 Uploaded Files Notes Per Month', 'Access to AI Humanizer(Coming Soon)'],
    // Add more plans and features as needed
  };

  useEffect(() => {
    // Firebase auth state observer
    const unsubscribe = onAuthStateChanged(auth, setUser);

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const handleClick = async (priceId: string) => {
    setLoading({ ...loading, [priceId]: true }); // Set loading to true for the clicked product
    console.log('priceId:', priceId);
  
    // Send request to server to create a new Checkout Session
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priceId, userId: user?.uid }) // include user in the body
    });
  
    const { sessionId } = await response.json();
  
    // Log the sessionId to the console
    console.log('sessionId:', sessionId);
  
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("Failed to load Stripe.js");
      return;
    }
  
    const { error } = await stripe.redirectToCheckout({ sessionId });
    setLoading({ ...loading, [priceId]: false }); // Set loading to false after redirecting
    if (error) {
      console.error(error);
    }
  };
  const pricingCardStyle = {
    backgroundColor: darkMode ? '#484963' : 'transparent' // Set to transparent in light mode
  };
  
  return (
    <div className="pricing-container">
      <div className="pricing-card" style={pricingCardStyle}>
        <h2 className="plan-name">Free Plan</h2>
        <p>$0 per month</p>
        <ul style={{ listStyleType: 'none' }}>
          {productFeatures['Free Plan'].map((feature, index) => (
            <li key={index} style={{ textAlign: 'center', fontSize: '1.4em', margin: '10px 0' }}>{feature}</li>
          ))}
        </ul>
      </div>
      {products.map((product) => (
        <div className="pricing-card" style={pricingCardStyle} key={product.priceId}>
          <h2 className="plan-name">{product.name}</h2>
          <p>${product.price / 100} per month</p>
          <ul style={{ listStyleType: 'none' }}>
            {productFeatures[product.name]?.map((feature, index) => (
              <li key={index} style={{ textAlign: 'center', fontSize: '1.4em', margin: '10px 0' }}>{feature}</li>
            ))}
          </ul>
          {loading[product.priceId] ? (
            <div className="spinner"></div> // Render spinner if loading is true for this product
          ) : (
            <button className="subscribe-button" onClick={() => handleClick(product.priceId)}>Subscribe</button> // Render button if loading is false for this product
          )}
        </div>
      ))}
    </div>
  );
}
export default PricingPage;