import { useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { UserContext } from './_app';
import { getAuth, signOut } from 'firebase/auth';

interface DashboardProps {
  children?: ReactNode;
};

export default function Dashboard({ children }: DashboardProps) {
  const [view, setView] = useState('overview');
  const user = useContext(UserContext);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const renderView = () => {
    switch (view) {
      case 'overview':
        return <h1 className="text-primary-dark-blue">Overview content</h1>;
      case 'settings':
        return <h1 className="text-primary-lime-green">Settings content</h1>;
      case 'profile':
        return <h1 className="text-primary-bright-cyan">Profile content</h1>;
      default:
        return <h1>Overview content</h1>;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light-grayish-blue text-primary-black">
      <Navbar />
      <header className="h-16 w-full flex items-center justify-between px-6 bg-primary-dark-blue text-neutral-white">
        <h1 className="font-bold text-2xl">Dashboard</h1>
        <button className="bg-primary-lime-green px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </header>
      <div className="flex flex-grow">
        <nav className="w-64 border-r-2 border-neutral-gray">
          <ul className="flex flex-col space-y-2 p-4">
            <li><button className="text-primary-dark-blue" onClick={() => setView('overview')}>Overview</button></li>
            <li><button className="text-primary-lime-green" onClick={() => setView('settings')}>Settings</button></li>
            <li><button className="text-primary-bright-cyan" onClick={() => setView('profile')}>Profile</button></li>
          </ul>
        </nav>
        <main className="flex-grow p-4">
          {renderView()}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
