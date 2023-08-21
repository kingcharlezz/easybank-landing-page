import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const MarkdownPage: React.FC = () => {
  const router = useRouter();
  const videoId = router.query.videoId;
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [markdown, setMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (videoId) {
      axios.get(`/api/cached_summary?v=${videoId}`)
        .then(response => {
          setMarkdown(response.data.summary_markdown);
        })
        .catch(err => console.error(err));
    }
  }, [videoId]);

  
  if (!videoId) {
    return <div>Loading...</div>;
  }

  if (!markdown) {
    return <div>Loading markdown...</div>;
  }
  useEffect(() => {
    // Set the class of body element based on darkMode state
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';

    // clean up function to reset style when component unmounts
    return () => {
      document.body.className = '';
    };
  }, [darkMode]);
  
  return (
    <div className="w-full min-h-screen">
      <div className="prose prose-lg max-w-full mx-auto my-12">
        <div className={`flex flex-col items-center justify-center min-h-screen py-2 px-4 ${darkMode ? 'bg-darker-blue text-neutral-white' : 'bg-white text-gray-900'}`}>
          <h1 className={`mt-12 text-4xl font-bold tracking-tight ${darkMode ? 'text-neutral-white' : 'text-gray-900'} sm:mt-10 sm:text-6xl`}>Your Notes:</h1>
          <div className="w-auto max-w-2xl mx-auto mt-8">
            <ReactMarkdown>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPage;
