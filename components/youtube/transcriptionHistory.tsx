import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { doc, getDocs, collection, getFirestore } from 'firebase/firestore';
import { DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { getAuth, User } from 'firebase/auth';
interface MyComponentProps {
    darkMode: boolean;
}

interface Video {
    videoId: string;
    title: string;
    date: Date;
}


const UserVideo: React.FC<MyComponentProps> = ({ darkMode }) => {
    const [videos, setVideos] = useState<Video[]>([]);

    // Modified function to first check videoName from Firestore
    const getVideoTitle = async (videoId: string, videoName?: string) => {
        if (videoName) {
            return videoName;
        }
    
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyAV6SBt7Ptnar-2ClKvlH1qyiMjb9i0r5w`);
        if (response.data.items[0]) {
            return response.data.items[0].snippet.title;
        } else {
            return "No title found";
        }
    };
    // test

    useEffect(() => {
        document.body.className = darkMode ? 'body-dark' : 'body-light';
    
        const auth = getAuth();
        const user: User | null = auth.currentUser;
        
        if (user) {
            const db = getFirestore();
            const userDoc = doc(db, 'users', user.uid);
            const videoCollection = collection(userDoc, 'transcribedVideos');
    
            getDocs(videoCollection).then(async (videoSnapshot) => {
                const fetchedVideos: Video[] = await Promise.all(videoSnapshot.docs.map(async (doc: DocumentData) => {
                    const videoId = doc.data().videoId;
                    const videoName = doc.data().videoName; // Get videoName from the Firestore document
                    const title = await getVideoTitle(videoId, videoName); // Pass videoName as a second argument
                    const date = new Date(doc.data().date.seconds * 1000);  
                    return { videoId: videoId, title: title, date: date };
                }));
    
                // Sort videos by date, from newest to oldest
                fetchedVideos.sort((a, b) => b.date.getTime() - a.date.getTime());
                setVideos(fetchedVideos);
            }).catch((error: any) => {
                console.log('Error getting document:', error);
            });
        } else {
            console.log("No user is signed in.");
        }
    }, [darkMode]);

    if (videos.length > 0) {
        return (
          <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} px-4 py-6`}>
            {videos.map((video: Video, index: number) => (
              <div key={index} className={`p-4 flex flex-wrap justify-between items-center rounded shadow-md ${darkMode ? 'bg-darker-blue text-neutral-white' : 'bg-white text-gray-900'} text-2xl`} style={{margin: '10px 0', borderBottom: index < videos.length - 1 ? '2px solid #4a5568' : 'none'}}>
                <div style={{maxWidth: '80%'}}>
                  <div className="flex flex-col text-left">
                  <div className="text-2xl text left truncate">{video.title}</div>
                    <div className="text-xl text left">Date: {video.date.toLocaleDateString()} {video.date.toLocaleTimeString()}</div>
                  </div>
                </div>
                <Link href={`/markdownPage?videoId=${video.videoId}`}>
                <button className={`text-2xl ${darkMode ? 'bg-dark-gray text-darker-blue' : 'bg-gray-900 text-gray-900'} rounded px-4 py-2`}>
                     View Notes
                </button>
                </Link>
              </div>
            ))}
          </div>
        );
      } else {
        return (
            <div className={`flex flex-col ${darkMode ? 'bg-darker-blue' : 'bg-white'} px-4 py-6`}>
                <h1 className={`mt-12 text-4xl font-bold tracking-tight ${darkMode ? 'text-neutral-white' : 'text-gray-900'} sm:mt-10 sm:text-6xl`}>Loading...</h1>
            </div>
        );
    }
}
    
export default UserVideo;
