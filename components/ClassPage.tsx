import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, getDoc } from 'firebase/firestore';
import Link from 'next/link';

interface MyComponentProps {
  darkMode: boolean;
}

const ClassFolders: React.FC<MyComponentProps> = ({ darkMode }) => {
  const [allClassData, setAllClassData] = useState<any[]>([]); // array to store all class data

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
          classesData.push({ className, videoIds }); // push an object with className and videoIds to array
        }
        setAllClassData(classesData);
      });
    }
  }, []);

  return (
    <div>
      <h1 className="col-span-4 text-center mt-12 text-4xl font-bold tracking-tight" style={{marginBottom: '20px'}}>
        My Classes
      </h1>
      <div className="myGrid">
        {allClassData.map((classData, index) => (
          <Link key={index} href={`/videoList?className=${classData.className}`}>
            <div className="myButton rounded-md py-2 px-3.5 font-semibold text-white shadow-sm cursor-pointer">
              {classData.className} ({classData.videoIds.length} videos)
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ClassFolders;