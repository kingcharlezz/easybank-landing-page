import { FC, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getFirestore, collection, where, getDocs, query } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

interface Product {
  name: string;
  price: number;
  priceId: string;
}

const PricingPage: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const stripePromise = loadStripe('pk_test_51NWlFcBvnwuagBF3TlXeR13qGtAemDvsU3xGLBntnkyBEWdeW034T9dqRJRBvsRuYq52XYV7fuyrs4D2x4SNRtCy00h71OfFRr');

  useEffect(() => {
    // Firaebase auth state observer
    const unsubscribe = onAuthStateChanged(auth, setUser);

    const fetchProducts = async () => {
      const productQuerySnapshot = await getDocs(query(collection(db, 'products'), where('active', '==', true)));
      const products: Product[] = [];
      for (const doc of productQuerySnapshot.docs) {
        const productData = doc.data();
        const priceQuerySnapshot = await getDocs(collection(doc.ref, 'prices'));
        for (const priceDoc of priceQuerySnapshot.docs) {
          const priceData = priceDoc.data();
          products.push({
            name: productData.name,
            price: priceData.unit_amount,
            priceId: priceDoc.id, // Use the document ID as the priceId
          } as Product);
        }
      }
      setProducts(products);
    };
    
    fetchProducts();

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const handleClick = async (priceId: string) => {
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
  
    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-card">
        <h2 className="plan-name">Free Plan</h2>
        <p>$0 per month</p>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </div>
      {products.map((product) => (
        <div className="pricing-card" key={product.priceId}>
          <h2 className="plan-name">{product.name}</h2>
          <p>${product.price / 100} per month</p>
          <ul>
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
          </ul>
          <button className="subscribe-button" onClick={() => handleClick(product.priceId)}>Subscribe</button>
        </div>
      ))}
    </div>
  );
};

export default PricingPage;
