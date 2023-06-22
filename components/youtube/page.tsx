"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, } from "react";
import { toast, ToastContainer } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import "react-toastify/dist/ReactToastify.css";
import Divider from "./components/Divider";
import Youtube from "./components/Youtube";
import {
  cachedSummary,
  isValidYoutubeUrl,
  parseChaptersFromSummary,
} from "./utils";
type ExampleProps = {
  darkMode: boolean;
};

export default function Example({ darkMode }: ExampleProps) {
  const [started, setStart] = useState(false);
  const [url, setUrl] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [ts, setTs] = useState(0);

  function LinkRenderer(props: any) {
    const href = props.href;

    // extract the ts from the youtube href
    // t=1234s where ts = 1234
    const regex = new RegExp("t=(\\d+)s");
    const _ts = parseInt((href.match(regex) || [])[1]);
  
    // convert seconds to minutes and seconds
    const minutes = Math.floor(_ts / 60);
    const seconds = _ts % 60;

    return (
      <a
          className="no-underline hover:opacity-80 cursor-pointer hover:underline"
          title={`Jump to ${minutes}m ${seconds}s`}
          style={{color: darkMode ? 'white' : 'black'}}
          onClick={() => {
              console.log(`Jump to ${minutes}m ${seconds}s`);
          }}
      >
          {`${minutes}m ${seconds}s`}
      </a>
  );
}

  const generateSummary = async (e: any) => {
    e.preventDefault;

    if (!urlRef.current) {
      toast.error("Please enter a valid youtube url");
      return;
    }

    // @ts-ignore
    const currentUrl = urlRef.current.value as string;

    // use regex to check if url is youtube linke
    if (!isValidYoutubeUrl(currentUrl)) {
      toast.error("Please enter a valid youtube url");
      return;
    }

    setStart(true);
    setSummary("");
    setLoading(true);
    setUrl(currentUrl);

    const response = await fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: currentUrl,
      }),
    });
    console.log("Edge function returned.");
    console.log(response);

    if (!response.ok) {
      toast.error("Error generating summary.");
      setLoading(false);
      throw new Error(response.statusText);
    } else {
      toast.success("Generating Summary!");
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }

    toast.success("Summary completed!");
    setLoading(false);
    console.log("Summary completed!", summary);
  };

  
  const generateFileSummary = async (e: any) => {
    e.preventDefault();
  
    if (!fileRef.current) {
      toast.error("Please upload a file");
      return;
    }
  
    const currentFile = fileRef.current?.files?.[0];
    if (!currentFile) {
      toast.error("Please upload a file");
      return;
    }
  
    const validTypes = ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm'];
    if (!validTypes.includes(currentFile.type)) {
      toast.error("Invalid file type. Please upload a valid audio/video file.");
      return;
    }
  
    setStart(true);
    setSummary("");
    setLoading(true);
  
    const formData = new FormData();
    formData.append("model", "tiny");
    formData.append("use_sse", "true");
    formData.append("file", currentFile);
  
    const response = await fetch("https://brilliant-panda-production.up.railway.app/transcribe_file", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      body: formData,
    });
  
    if (!response.ok) {
      const errorMessage = `Error generating summary: ${response.statusText}`;
      toast.error(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    } else {
      toast.success("Generating Summary!");
    }
  
    const data = response.body;
    if (!data) {
      return;
    }
    let isDone = false; // add this flag to track when the process is done

    function onParse(event: ParsedEvent | ReconnectInterval) {
      if (event.type === "event") {
        const data = event.data.trim();
        if (data === "[DONE]") {
          isDone = true; // set the flag to true when done
          return;
        }
        try {
          const json = JSON.parse(data);
          const text = json.text;
          setSummary((prev) => prev + text);
        } catch (e) {
          console.log({ e });
        }
      }
    }
  
    const parser = createParser(onParse);
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
  
    while (!done && !isDone) { // modify the loop condition to break when 'isDone' is true
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
  
    if (isDone) {
      toast.success("Summary completed!");
      setLoading(false);
      console.log("Summary completed!", summary);
    }
  };

  const handleProcessing = () => {
    const url = urlRef.current?.value;
    const file = fileRef.current?.files?.[0]; // add null check with optional chaining
  
    const syntheticEvent = { preventDefault: () => {} }; // Create a synthetic event
  
    if (url) {
      generateSummary(syntheticEvent);
    } else if (file) {
      generateFileSummary(syntheticEvent);
    } else {
      toast.error("Please enter a YouTube URL or choose a file to upload.");
    }
  };

  const generateShorten = async (e: any) => {
    e.preventDefault;
    setLoading(true);

    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: summary,
      }),
    });
    console.log("Edge function returned.");
    console.log(response);

    if (!response.ok) {
      toast.error("Error shorttening summary.");
      setLoading(false);
      throw new Error(response.statusText);
    } else {
      toast.success("Generating Summary!");
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    setSummary("");

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }

    toast.success("Summary shorten completed!");
    setLoading(false);
    console.log("Summary shortten completed!", summary);
  };

  // I believe this is the same as componentDidMount
  // if there is a videoId in the url, set the url to the videoId
  // and check if there is a cached summary, if so, set the summary
  // @ts-ignore
  const videoId = useSearchParams().get("v");
  useEffect(() => {
    if (videoId) {
      setUrl("https://www.youtube.com/watch?v=" + videoId);
      // @ts-ignore
      urlRef.current.value = "https://www.youtube.com/watch?v=" + videoId;
      setStart(true);
      setLoading(true);
      cachedSummary(videoId).then((res) => {
        const { summary_markdown } = res;
        if (summary_markdown) {
          toast.info("Cached summary found!");
          setSummary(summary_markdown);
        } else {
          toast.info("No cached summary found.");
        }
        setLoading(false);
      });
    }
  }, []);
  return (
    <>
      <div className={darkMode ? 'text-neutral-white border-neutral-white bg-darker-blue' : 'text-primary-black border-primary-black bg-white'}>
        <ToastContainer />
        <div className="lg:grid lg:grid-cols-12">
          <div className="px-6 pt-10 pb-24 sm:pb-32 lg:col-span-7 lg:px-0 lg:pt-20 lg:pb-56 xl:col-span-6">
            <div className="max-w-2xl lg:mx-0">
              <h1 className={`mt-12 text-4xl font-bold tracking-tight ${darkMode ? 'text-neutral-white' : 'text-gray-900'} sm:mt-10 sm:text-6xl`}>
                Automated Note Taking
              </h1>
              <p className={`mt-6 text-lg leading-8 ${darkMode ? 'text-neutral-white' : 'text-gray-600'}`}>
                Upload a YouTube Link or File, and have AI automatically take notes for you! Note that file uploads take longer to generate notes for, usually taking about 4 minutes per hour of video.
              </p>
              <div className="mt-10 flex flex-col items-center gap-y-6">
                <div className="relative">
                  <label htmlFor="url" className={`absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium ${darkMode ? 'text-neutral-white' : 'text-gray-900'}`}>
                    <span className="text-primary-black">Youtube Link</span>
                  </label>
                  <input
                    type="text"
                    name="url"
                    id="url"
                    ref={urlRef}
                    size={40}
                    className={`block w-full rounded-md border-0 py-1.5 ${darkMode ? 'text-gray-900' : 'text-gray-900'} shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 lg:text-base`}
                    placeholder="https://www.youtube.com/watch?v=1234567890"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="file" className={`absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium ${darkMode ? 'text-gray-900' : 'text-gray-900'}`}>
                    Upload File
                  </label>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    ref={fileRef}
                    className={`block w-full rounded-md border-0 py-1.5 ${darkMode ? 'text-neutral-white' : 'text-gray-900'} shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 lg:text-base`}
                  />
                </div>
                <button
                  onClick={handleProcessing}
                  disabled={loading}
                  type="button"
                  className={`rounded-md bg-blue-600 py-2 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-opacity-50 focus:outline-none disabled:opacity-80 goButton ${darkMode ? 'text-neutral-white' : 'text-primary-black'}`}
                >
                  Go!
                </button>
              </div>
            </div>
          </div>
  
          <div className="relative lg:col-span-5 lg:-mr-8 my-auto">
            {started ? <Youtube url={url} ts={ts} /> : null}
          </div>
        </div>
  
        {started && summary && summary.length > 0 ? (
          <>
            <Divider summary={summary} url={url} shortenFn={generateShorten} darkMode={darkMode} />
            <article className={`prose prose-red w-full border-red-100 mx-auto lg:px-0 ${darkMode ? 'text-neutral-white bg-darker-blue' : 'text-primary-black bg-white'}`}>
            <div className="parent-component" style={{display: 'flex', justifyContent: 'center', }}>
                <div className="summary-output" style={{textAlign: 'justify'}}>
              <ReactMarkdown
                components={{
                  a: LinkRenderer,
                  h1: ({ node, ...props }) => <h2 {...props} className={darkMode ? 'text-neutral-white' : 'text-primary-black'} />,
                  h2: ({ node, ...props }) => <h2 {...props} className={darkMode ? 'text-neutral-white' : 'text-primary-black'} />,
                  h3: ({ node, ...props }) => <h2 {...props} className={darkMode ? 'text-neutral-white' : 'text-primary-black'} />, 
                  p: ({ node, ...props }) => <p {...props} className={darkMode ? 'text-neutral-white' : 'text-primary-black'} />,
                }}
              >
                {"> Heres a tip! Click the # to jump to the timestamp.\n" +
                  summary +
                  "\n"}
              </ReactMarkdown>
              </div>
            </div>
            </article>
            <Divider summary={summary} url={url} shortenFn={generateShorten} darkMode={darkMode} />
          </>)
          : null}
      </div>
    </>
  );
};