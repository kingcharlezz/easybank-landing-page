import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, getDoc } from 'firebase/firestore';
import Link from 'next/link';

interface MyComponentProps {
  darkMode: boolean;
}

interface Video {
  videoId: string;
  title: string;
}

const UserVideo: React.FC<MyComponentProps> = ({ darkMode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const router = useRouter();
  const className = router.query.className as string;

  const getVideoTitle = async (videoId: string) => {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyAV6SBt7Ptnar-2ClKvlH1qyiMjb9i0r5w`);
    if (response.data.items[0]) {
      return response.data.items[0].snippet.title;
    } else {
      return "No title found";
    }
  };

  useEffect(() => {
    
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, 'users', user.uid);

      getDoc(userDoc).then(async (doc) => {
        const videoData: Video[] = [];
        const classesMap = doc.data()?.classes || {};
        const videoIds = classesMap[className];

        for (const videoId of videoIds) {
          const title = await getVideoTitle(videoId);
          videoData.push({ videoId, title }); // push an object with videoId and title to array
        }

        setVideos(videoData);
      });
    }
  }, [darkMode, className]);

  return (
    <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} px-4 py-6`}>
      {videos.length > 0 ? videos.map((video, index) => (
        <div key={index} className={`p-4 flex flex-wrap justify-between items-center rounded shadow-md ${darkMode ? 'bg-darker-blue text-neutral-white' : 'bg-white text-gray-900'} text-2xl`} style={{margin: '10px 0', borderBottom: index < videos.length - 1 ? '2px solid #4a5568' : 'none'}}>
          <div style={{maxWidth: '80%'}}>
            <div className="flex flex-col text-left">
              <div className="text-2xl text left truncate">{video.title}</div>
            </div>
          </div>
          <Link href={`/markdownPage?videoId=${video.videoId}`}>
            <button className={`text-2xl ${darkMode ? 'bg-dark-gray text-darker-blue' : 'bg-gray-900 text-gray-900'} rounded px-4 py-2`}>
              View Notes
            </button>
          </Link>
        </div>
      )) : (
        <h1 className={`mt-12 text-4xl font-bold tracking-tight ${darkMode ? 'text-neutral-white' : 'text-gray-900'} sm:mt-10 sm:text-6xl`}>Loading...</h1>
      )}
    </div>
  );
};

export default UserVideo;
