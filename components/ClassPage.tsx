import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import Link from 'next/link';

interface MyComponentProps {
  darkMode: boolean;
}

const ClassFolders: React.FC<MyComponentProps> = ({ darkMode }) => {
  const [allClassData, setAllClassData] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, 'users', user.uid);

      getDoc(userDoc).then((doc) => {
        const classesData: any[] = [];
        const classesMap = doc.data()?.classes || {};
        for (const className in classesMap) {
          const videoIds = classesMap[className];
          classesData.push({ className, videoIds });
        }
        setAllClassData(classesData);
        setIsLoading(false); // Set loading to false after fetching class data
      });
    }
  }, []);

  const handleDelete = async (className: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, 'users', user.uid);

      await updateDoc(userDoc, {
        [`classes.${className}`]: deleteField()
      });

      setAllClassData(allClassData.filter(classData => classData.className !== className));
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? 'rgb(52, 53, 65)' : 'white';

    // clean up function to reset style when component unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [darkMode]);

  if (isLoading) {
    return (
      <div>
        <h1 className="col-span-4 text-center mt-12 text-4xl font-bold tracking-tight">
          Loading...
        </h1>
      </div>
    );
  } else if (allClassData.length > 0) {
    return (
    <div>
      <h1 className="col-span-4 text-center mt-12 text-4xl font-bold tracking-tight" style={{marginBottom: '20px'}}>
        My Classes
      </h1>
      <div className="myGrid">
        {allClassData.map((classData, index) => (
          <Link key={index} href={`/videoList?className=${classData.className}`}>
            <div 
              className={`myButton rounded-md py-2 px-3.5 font-semibold text-white shadow-sm cursor-pointer relative ${index % 2 === 0 ? 'odd' : 'even'}`}
              style={{ position: 'relative' }}
            >
              {classData.className} ({classData.videoIds.length} videos)
              <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                <button 
                  className="mb-1 mr-1" 
                  style={{ background: 'transparent' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(classData.className);
                  }}
                  onBlur={() => setOpenMenu(null)}
                >
                  ...
                </button>
                {openMenu === classData.className && (
                  <div className="absolute top-full right-0 mt-1 shadow">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(classData.className);
                      }}
                      style={{
                        background: 'transparent',
                        color: darkMode ? 'white' : 'black'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} else {
  return (
    <div>
      <h1 className="col-span-4 text-center mt-12 text-4xl font-bold tracking-tight">
        No classes found. You can add classes in the appropriate section.
      </h1>
    </div>
  );
}
}

export default ClassFolders;