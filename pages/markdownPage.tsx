import { useRouter } from 'next/router';
import MarkdownPage from '../components/youtube/markdownPage'; // adjust path to your actual component location



const MarkdownRoute = () => {
  const router = useRouter();
  const { videoId } = router.query;

  return (
    <div className="max-w-full w-full min-h-screen">
      {videoId && <MarkdownPage/>}
    </div>
  );
};

export default MarkdownRoute;