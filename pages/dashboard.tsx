import { useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Example from '../components/youtube/page';
import { UserContext } from './_app';
import { getAuth, signOut } from 'firebase/auth';
import { FaUsers, FaDollarSign, FaBoxOpen, FaShoppingCart } from 'react-icons/fa';

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
      case 'noteTaking':
        return <Example darkMode={darkMode} />; // Add your component or content for the note taking view here
      default:
        return <h1>Overview content</h1>;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  }

  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <div className={`${darkMode ? 'bg-dark-blue text-neutral-white' : 'bg-neutral-very-light-gray text-primary-black'} h-screen flex`}>
      <aside className={`${darkMode ? 'bg-dark-gray' : 'bg-neutral-light-grayish-blue'} shadow w-64 min-h-screen p-6 fixed top-0 left-180`}>
        <h1 className={`${darkMode ? 'text-neutral-white' : 'text-primary-black'} text-2xl font-sans font-bold mb-6`}>Your Dashboard</h1>
        <nav>
          <a 
            href="#"
            onClick={() => setView('noteTaking')}
            className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}
          >
            <FaUsers className="mr-2" /> Automated Note-Taking
          </a>
          <a href="#" className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}>
            <FaDollarSign className="mr-2" /> Sales
          </a>
          <a href="#" className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}>
            <FaBoxOpen className="mr-2" /> Products
          </a>
          <a href="#" className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}>
            <FaShoppingCart className="mr-2" /> Orders
          </a>
        </nav>
      </aside>
      <main className={`${darkMode ? 'bg-darker-blue' : 'bg-neutral-very-light-gray'} flex-grow mx-auto py-10 px-6 ml-64`}>
        <header className={`${darkMode ? 'bg-dark-gray' : 'bg-neutral-light-grayish-blue'} flex items-center justify-between p-5 rounded-md mb-10`}>
          <h2 className="text-3xl font-sans font-bold">!</h2>
          <div className="flex items-center justify-end">
            <button 
              onClick={toggleDarkMode} 
              className={`mr-2 ${darkMode ? 'bg-darker-blue text-neutral-white border-neutral-white' : 'bg-darker-blue text-neutral-white border-primary-black'} rounded-md px-4 py-2`}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="bg-darker-blue text-white border-primary-black border-2 rounded-md px-4 py-2">
              Logout
            </button>
          </div>
        </header>
        {renderView()}
      </main>
    </div>
  );
};
