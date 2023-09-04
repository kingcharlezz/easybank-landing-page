import { FC, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getFirestore, collection, where, getDocs, query } from 'firebase/firestore';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
const db = getFirestore();

interface Product {
  name: string;
  price: number;
  priceId: string;
}

  

const PricingPage: FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      name: 'Premium Plan',
      price: 999,
      priceId: 'premium-plan-id',
    },
    {
      name: 'PremiumPlus Plan',
      price: 1999,
      priceId: 'premiumplus-plan-id',
    },
    // Add more plans as needed
  ]);
  // Define a mapping of product names to features
  const productFeatures: { [key: string]: string[] } = {
    'Free Plan': ['10 Youtube Videos Notes Per Month', '3 Uploaded Files Notes Per Month', 'No Access to AI Humanizer(Coming Soon)'],
    'Premium Plan': ['50 Youtube Videos Notes Per Month', '20 Uploaded Files Notes Per Month', 'Access to AI Humanizer  (Coming Soon)'],
    'PremiumPlus Plan': ['200 Youtube Videos Notes Per Month', '50 Uploaded Files Notes Per Month', 'Access to AI Humanizer(Coming Soon)'],
    // Add more plans and features as needed
  };

  useEffect(() => {
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
            priceId: priceDoc.id,
          } as Product);
        }
      }
      setProducts(products);
    };

    fetchProducts();
  }, []);

  const handleClick = async (priceId: string) => {
    // Redirect to the login page
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-8 mt-20 flex-grow">
        <div className="pricing-container">
          <div className="pricing-card" style={{ backgroundColor: '#acc5ce' }}>
            <h2 className="plan-name">Free Plan</h2>
            <p>$0 per month</p>
            <ul style={{ listStyleType: 'none' }}>
              {productFeatures['Free Plan'].map((feature, index) => (
                <li key={index} style={{ textAlign: 'center', fontSize: '1.4em', margin: '10px 0' }}>{feature}</li>
              ))}
            </ul>
          </div>
          {products.map((product) => (
            <div className="pricing-card" key={product.priceId} style={{ backgroundColor: '#acc5ce' }}>
              <h2 className="plan-name">{product.name}</h2>
              <p>${product.price / 100} per month</p>
              <ul style={{ listStyleType: 'none' }}>
                {productFeatures[product.name]?.map((feature, index) => (
                  <li key={index} style={{ textAlign: 'center', fontSize: '1.4em', margin: '10px 0' }}>{feature}</li>
                ))}
              </ul>
              <button className="subscribe-button" onClick={() => handleClick(product.priceId)}>Subscribe</button>
            </div>
          ))}
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
  
export default PricingPage;