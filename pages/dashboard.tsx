import { useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Example from '../components/youtube/page';
import UserVideo from '../components/youtube/transcriptionHistory';
import TextAnalyzerPage from '../components/humanizer/page';
import { UserContext } from './_app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useSpring, animated } from '@react-spring/web'
import AccountPage from '../components/AccountPage';
import ClassPage from '../components/ClassPage';
import SubscriptionPage from '../components/SubscriptionPage';

interface DashboardProps {
  children?: ReactNode;
}

const isMobile = () => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
};

export default function Dashboard({ children }: DashboardProps) {
  const [view, setView] = useState<string[]>(['noteTaking', 'overview']);
  const [isNoteTakingExpanded, setIsNoteTakingExpanded] = useState(false);
  const [isHumanizerExpanded, setIsHumanizerExpanded] = useState(false);
  const user = useContext(UserContext);
  const router = useRouter();
  const auth = getAuth();
  const [accessCounts, setAccessCounts] = useState<{[key: string]: number}>({});
  const db = getFirestore();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);  // New state to manage mobile devices

  useEffect(() => {
    setIsMobileDevice(isMobile());  // Using the isMobile function to set the state
  }, []);

  // Redirect if user is not defined
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user]);

  // Function to handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
          default:
            return <Example darkMode={darkMode} />;
        }
      case "humanizer":
        if (view[1] === "account") {
          return <ClassPage darkMode={darkMode} />;
        }
        return <SubscriptionPage darkMode={darkMode} />;
      case "account":
        return <AccountPage darkMode={darkMode} />;
      default:
        return <ClassPage darkMode={darkMode} />;
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
  
  const { height: noteTakingHeight, opacity: noteTakingOpacity, transform: noteTakingTransform } = useSpring({
    from: { height: '0px', opacity: 0, transform: 'translate3d(0,-20px,0)' },
    to: {
      height: isNoteTakingExpanded ? '50px' : '0px',
      opacity: isNoteTakingExpanded ? 1 : 0,
      transform: `translate3d(0,${isNoteTakingExpanded ? 0 : -20}px,0)`,
    },
  });

  const { height: humanizerHeight, opacity: humanizerOpacity, transform: humanizerTransform } = useSpring({
    from: { height: '0px', opacity: 0, transform: 'translate3d(0,-20px,0)' },
    to: {
      height: isHumanizerExpanded ? '50px' : '0px',
      opacity: isHumanizerExpanded ? 1 : 0,
      transform: `translate3d(0,${isHumanizerExpanded ? 0 : -20}px,0)`,
    },
  });

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? 'rgb(52, 53, 65)' : 'white';

    // clean up function to reset style when component unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [darkMode]);
  
  if (isMobileDevice) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: 'black' }}>
        <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
          Mobile device use not yet supported
        </div>
        <div style={{ marginTop: '20px', color: 'white' }}>
          Please try our website on a laptop or desktop at <a href="https://notescribe.ai" style={{ color: 'white' }}>https://notescribe.ai</a>
        </div>
      </div>
    );
  }
  else
  return (
    <div className={`${
      darkMode ? 'bg-dark-blue text-neutral-white' : 'bg-neutral-very-light-gray text-primary-black'
    } min-h-screen grid grid-cols-[16rem,1fr]`}>

      {/* Add button to toggle sidebar on small screens */}
      <button
        className="md:hidden fixed top-0 right-0 m-6"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? 'Close menu' : 'Open menu'}
      </button>

      <aside className={`${
        darkMode ? 'bg-dark-gray' : 'bg-neutral-light-grayish-blue'
      } fixed shadow w-64 min-h-screen p-6 transform transition-transform duration-200 md:transform-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
          <h1 className={`${darkMode ? 'text-neutral-white' : 'text-primary-black'} text-2xl font-sans font-bold mb-6`}>Your Dashboard</h1>
          <nav>
          <a
            href="#"
            onClick={() => {
              setIsNoteTakingExpanded(!isNoteTakingExpanded); //toggle display of subitems
              setView(['noteTaking', 'default']); //set default component
              }}
            className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block text-lg`} // Increase font size to 'lg'
            >
            Note-Taking
          </a>
          <animated.ul style={{ overflow: 'hidden', height: noteTakingHeight, opacity: noteTakingOpacity, transform: noteTakingTransform }} className="list-disc ml-8"> {/* Bulleted list */}
            <li className="my-2"> {/* List items */}
              <a
                href="#"
                onClick={() => setView(['noteTaking', 'products'])}
                className={`${
                  darkMode
                    ? 'text-neutral-white border-neutral-white'
                    : 'text-primary-black border-primary-black'
                } text-lg`} // Increase font size to 'lg'
              >
                Note History
              </a>
            </li>
          </animated.ul>
          <a
            href="#"
            onClick={() => {
              setIsHumanizerExpanded(!isHumanizerExpanded); //toggle display of subitems
              setView(['humanizer']); //set default component
              }}
            className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block text-lg`} // Increase font size to 'lg'
          >
            Account Subscription
          </a>
          <animated.ul style={{ overflow: 'visible', height: humanizerHeight, opacity: humanizerOpacity, transform: humanizerTransform }} className="list-disc ml-8"> {/* Bulleted list */}
            <li className="my-2"> {/* List items */}
              <a
                href="#"
                onClick={() => setView(['account', 'account'])}
                className={`${
                  darkMode
                    ? 'text-neutral-white border-neutral-white'
                    : 'text-primary-black border-primary-black'
                } text-lg`} // Increase font size to 'lg'
              >
                Account Settings
              </a>
            </li>
          </animated.ul>
        </nav>
        <a
          href="#"
          onClick={() => setView(['orders'])} // Setting the view to 'account' when the tab is clicked
          className={`${darkMode ? 'text-neutral-white border-neutral-white' : 'text-primary-black border-primary-black'} mb-4 border-2 hover:text-dark-blue rounded p-3 transition-colors duration-200 block text-lg`} // Increase font size to 'lg'
        >
            Your Classes
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
