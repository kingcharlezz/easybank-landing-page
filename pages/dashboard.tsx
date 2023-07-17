import { useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Example from '../components/youtube/page';
import UserVideo from '../components/youtube/transcriptionHistory';
import TextAnalyzerPage from '../components/humanizer/page';
import { UserContext } from './_app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { FaUsers, FaDollarSign, FaBoxOpen, FaShoppingCart } from 'react-icons/fa';
import { useSpring, animated } from '@react-spring/web'
import AccountPage from '../components/AccountPage';
import ClassPage from '../components/ClassPage';

interface DashboardProps {
  children?: ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  const [view, setView] = useState<string[]>(['noteTaking', 'overview']);
  const [isNoteTakingExpanded, setIsNoteTakingExpanded] = useState(false);
  const user = useContext(UserContext);
  const router = useRouter();
  const auth = getAuth();
  const [accessCounts, setAccessCounts] = useState<{[key: string]: number}>({});
  const db = getFirestore();

    // Redirect if user is not defined
    useEffect(() => {
      if (!user) {
        router.push('/');
      }
    }, [user]);
  

  const updateAccessCount = async (component: string) => {
    if (!user) {
      router.push('/');
      return;
    }
  
    const userDoc = doc(db, "users", user.uid);
    const userDocData = await getDoc(userDoc);
  
    const accessCounts = userDocData.data()?.accessCounts || {};
  
    accessCounts[component] = (accessCounts[component] || 0) + 1;
    await updateDoc(userDoc, { accessCounts });
  
    setAccessCounts(accessCounts);
  };



  const renderView = () => {
    switch (view[0]) {
      case "noteTaking":
        if (view[1] === "default") {
          return <Example darkMode={darkMode} />;
        }
        switch (view[1]) {
          case "products":
            return <UserVideo darkMode={darkMode} />;
          case "orders":
            return <ClassPage darkMode={darkMode} />;
          default:
            return <Example darkMode={darkMode} />;
        }
      case "humanizer":
        return <TextAnalyzerPage />;
      case "account":
        return <AccountPage darkMode={darkMode} />;
      default:
        return <Example darkMode={darkMode} />;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  const toggleDarkMode = () => {
    if (!darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    setDarkMode(!darkMode);
  };
  
  const { height, opacity, transform } = useSpring({
    from: { height: '0px', opacity: 0, transform: 'translate3d(0,-20px,0)' },
    to: {
      height: isNoteTakingExpanded ? '100px' : '0px',
      opacity: isNoteTakingExpanded ? 1 : 0,
      transform: `translate3d(0,${isNoteTakingExpanded ? 0 : -20}px,0)`,
    },
  });
  
    return (
      <div className={`${
        darkMode ? 'bg-dark-blue text-neutral-white' : 'bg-neutral-very-light-gray text-primary-black'
      } min-h-screen grid grid-cols-[16rem,1fr]`}>
      <aside className={`${
        darkMode ? 'bg-dark-gray' : 'bg-neutral-light-grayish-blue'
      } fixed shadow w-64 min-h-screen p-6`}>
          <h1 className={`${darkMode ? 'text-neutral-white' : 'text-primary-black'} text-2xl font-sans font-bold mb-6`}>Your Dashboard</h1>
          <nav>
          <a
            href="#"
              onClick={() => {
                setIsNoteTakingExpanded(!isNoteTakingExpanded); //toggle display of subitems
                setView(['noteTaking', 'default']); //set default component
                }}
                className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}
                  >
                  <FaUsers className="mr-2" /> Automated Note-Taking
                  </a>
            <animated.ul style={{ overflow: 'hidden', height, opacity, transform }} className="list-disc ml-8"> {/* Bulleted list */}
              <li className="my-2"> {/* List items */}
                <a
                  href="#"
                  onClick={() => setView(['noteTaking', 'products'])}
                  className={`${
                    darkMode
                      ? 'text-neutral-white border-neutral-white'
                      : 'text-primary-black border-primary-black'
                  } text-sm`} // Notice the additional classes for the smaller button
                >
                  <FaBoxOpen className="mr-2" /> Products
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  onClick={() => setView(['noteTaking', 'orders'])}
                  className={`${
                    darkMode
                      ? 'text-neutral-white border-neutral-white'
                      : 'text-primary-black border-primary-black'
                  } text-sm`} // Notice the additional classes for the smaller button
                >
                  <FaShoppingCart className="mr-2" /> Orders
                </a>
              </li>
            </animated.ul>
            <a
              href="#"
              onClick={() => setView(['humanizer'])}
              className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}
            >
              <FaDollarSign className="mr-2" /> Essay Humanizer
            </a>
          </nav>
          <a
            href="#"
            onClick={() => setView(['account'])} // Setting the view to 'account' when the tab is clicked
            className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block`}
            >
              Account
          </a>
        </aside>
      <div style={{ marginLeft: '16rem' }}> {/* Use style prop to add margin-left */}
      <main className={`${darkMode ? 'bg-darker-blue' : 'bg-neutral-very-light-gray'} h-screen w-[calc(100%-16rem)] py-10 px-6 flex flex-col`}>
        <header className={`${darkMode ? 'bg-dark-gray' : 'bg-neutral-light-grayish-blue'} flex items-center justify-between p-5 rounded-md mb-10`}>
            <h2 className="text-3xl font-sans font-bold">Welcome back!</h2>
            <div className="flex items-center justify-end">
              <button
                onClick={toggleDarkMode}
                className={`mr-2 ${darkMode ? 'bg-darker-blue text-neutral-white border-neutral-white' : 'bg-darker-blue text-neutral-white border-primary-black'} rounded-md px-4 py-2`}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-darker-blue text-white border-primary-black border-2 rounded-md px-4 py-2"
              >
                Logout
              </button>
            </div>
          </header>
          <div className="w-full h-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

