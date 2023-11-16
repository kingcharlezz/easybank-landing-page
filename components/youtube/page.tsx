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
import { extractVideoId } from "./utils";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc, setDoc, collection , addDoc  } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import React from "react";
const auth = getAuth();
const db = getFirestore();
import { Dna } from  'react-loader-spinner'


type PaymentTierType = "Premium" | "PremiumPlus";
interface SummaryRendererProps {
  summary: string;
}
// Define the maximum route usage for each payment tier
const MAX_API_USAGE: Record<PaymentTierType, Record<string, number>> = {
  "Premium": { "summary": 50, "fileSummary": 20 },
  "PremiumPlus": { "summary": 200, "fileSummary": 50}
}

export function useRouteRestriction(apiName: string) {
  const [loading, setLoading] = useState(true);
  const [overLimit, setOverLimit] = useState(false);
  const [checkingApiUsage, setCheckingApiUsage] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    async function checkApiUsage() {
      setCheckingApiUsage(true);
      const user = auth.currentUser;
    
      if (user && !hasChecked) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
    
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Here we assert the type
          const apiCounts: Record<string, {usageCount: number}> = userData.apiCounts || {};
    
          console.log("API counts:", apiCounts);
    
          const accountInfoRef = doc(db, "users", user.uid, "accountinfo", "info");
          console.log("Account info ref:", accountInfoRef);
          const accountInfoDoc = await getDoc(accountInfoRef);
          console.log("Account info doc:", accountInfoDoc);
    
          if (accountInfoDoc.exists()) {
            const accountInfoData = accountInfoDoc.data();
            console.log("Account info data:", accountInfoData);
            const subscriptionStatus = accountInfoData.subscriptionStatus;
            const paymentTier = accountInfoData.paymentTier as PaymentTierType;
    
            // If the payment tier doesn't exist yet, use a default value
            const selectedApiUsage: Record<string, number> = MAX_API_USAGE[paymentTier] || { "summary": 10, "fileSummary": 3 };
    
            // If the user has an active subscription and their API count for the specified route is over the maximum, set overLimit to true
            const newOverLimit = subscriptionStatus === "active" && apiCounts[apiName] && apiCounts[apiName].usageCount >= selectedApiUsage[apiName];
            if (newOverLimit !== overLimit) {
              console.log(`API usage count for ${apiName} has exceeded the limit for the ${paymentTier} tier.`);
              setOverLimit(newOverLimit);
            }
          } else {
            console.log(`No account info found for user with ID ${user.uid}`);
          }
          setHasChecked(true);
        } else {
          console.log(`No user document found for user with ID ${user.uid}`);
        }
      }
      // Add this check to set loading to false when there's no user or hasChecked is true
      if (!user || hasChecked) {
        setLoading(false);
      }
      setCheckingApiUsage(false);
    }
    checkApiUsage();
  }, [hasChecked]);

  return { loading, overLimit, checkingApiUsage };
}

  
async function incrementCounter(apiName: string) {
  const user = auth.currentUser;

  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const apiCounts = userData.apiCounts || {};

      if (apiCounts[apiName]) {
        // increment the count and update the timestamp
        apiCounts[apiName].usageCount += 1;
        
      } else {
        // initialize if it does not exist
        apiCounts[apiName] = {usageCount: 1};
      }

      console.log(`Updating user ${user.uid} with data:`, { apiCounts: apiCounts });
      await updateDoc(userRef, { apiCounts: apiCounts });

    } else {
      // create for new user
      const apiCounts = { 
        [apiName]: {
          usageCount: 1,
        }
      };
      console.log(`Setting doc for user ${user.uid} with data:`, { apiCounts: apiCounts });
      await setDoc(userRef, { apiCounts: apiCounts });
    }

  } else {
    // Handle case where there is no user signed in
    console.log("No user is signed in.");
  }
}



export default function Example({ darkMode }: ExampleProps) {
  const [started, setStart] = useState(false);
  const [url, setUrl] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const classRef = useRef<HTMLInputElement>(null);
  const videoNameRef = useRef<HTMLInputElement>(null);
  const [uid, setUid] = useState("");
  const summaryRestriction = useRouteRestriction('summary');
  const fileSummaryRestriction = useRouteRestriction('fileSummary');
  const [videoName, setVideoName] = useState("")
  const [spinner, setSpinner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [ts, setTs] = useState(0);

  const auth = getAuth();

  const [classInput, setClassInput] = useState("");
  const [classSuggestions, setClassSuggestions] = useState<string[]>([]);
  const [allClassNames, setAllClassNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchClassNames = async () => {
      if (!uid) {
        // If uid is not defined, don't try to fetch class names
        return;
      }
  
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const classes = userData.classes || {};
        
        // Extract the class names and update the state
        const classNames = Object.keys(classes);
        setAllClassNames(classNames);
      }
    };
  
    fetchClassNames();
  }, [uid]);

const handleClassInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  setClassInput(value);

  if (value === "") {
    setClassSuggestions([]);
  } else {
    const suggestions = allClassNames.filter((className) =>
      className.toLowerCase().startsWith(value.toLowerCase())
    );
    setClassSuggestions(suggestions);
  }
};


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        console.log(user.uid);
      } else {
        console.log("No user is signed in.");
      }
    });
  
    return () => unsubscribe();
  }, []);

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
  
const generateSummary = async (e: any, overLimit: boolean, loading: boolean, checkingApiUsage: boolean) => {
  e.preventDefault();

  if (loading || checkingApiUsage) {
    // Handle loading state, e.g., show loading spinner
    toast.info("Checking your usage limits. Please wait...");
    return;
  } else if (overLimit) {
    toast.error("You have reached your usage limit for generating summaries. Please try again later.");
    return;
  }

  if (!urlRef.current) {
    toast.error("Please enter a valid youtube url");
    return;
  }

  // @ts-ignore
  const currentUrl = urlRef.current.value as string;

  // use regex to check if url is youtube link
  if (!isValidYoutubeUrl(currentUrl)) {
    toast.error("Please enter a valid youtube url");
    return;
  }

  setStart(true);
  setSummary("");
  setLoading(true);
  setUrl(currentUrl);
  setSpinner(true);
  const videoId = extractVideoId(currentUrl);
try {
  try {
    const className = classRef.current?.value;  // Make sure to create this ref
    try {
      const userRef = doc(db, "users", uid);   // Reference to the user document
      const userDoc = await getDoc(userRef);   // Get the user document
    
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userClasses = userData.classes || {};  // Get the classes object
    
        // If className and videoId are defined, add them to the userClasses object
        if (className && videoId) {
          if (userClasses[className]) {
            userClasses[className].push(videoId);
          } else {
            userClasses[className] = [videoId];
          }
    
          // Update the user document
          await updateDoc(userRef, { classes: userClasses });
        } 
      } else {
        // Handle the case where the user document doesn't exist
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error writing document: ", error);
    }

    type VideoRequest = {
      videoId: string | null;
      uid: string;
      videoName?: string; // Marking videoName as optional
    };
    
    const requestBody: VideoRequest = {
      videoId: videoId,
      uid: uid,
    };
    
    const responseVideoID = await fetch("/api/saveVideoID", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!responseVideoID.ok) {
      toast.success("Video ID Already Saved");
      setLoading(false);
      throw new Error(responseVideoID.statusText);
    }
  } catch (err) {
    console.log("Error while saving VideoID: ", err);
  }

  const response = await fetch("/api/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: currentUrl,
    }),
  });
  console.log(videoId)

  console.log("Edge function returned.");
  console.log(response);

  if (!response.ok) {
    toast.error("Error generating summary.");
    setLoading(false);
    throw new Error(response.statusText);
  } else {
    toast.success("Generating Summary!");
  }
  console.log(videoId)
  // This data is a ReadableStream
  const data = response.body;
  if (!data) {
    return;
  }

  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let localSummary = "";

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    localSummary += chunkValue;
    setSummary((prev) => {
      if (prev === "") {
        setSpinner(false); // Stop loading when text output begins
      }
      return prev + chunkValue;
    });
  }
/*
  if (videoId) {
    const embeddings = await generateEmbeddings(localSummary, videoId);
    if (embeddings) {
      // Save embeddings to your database along with videoId
      // This will be done in your server-side code
      console.log("Embeddings generated:", embeddings);
    } else {
      console.log("Failed to generate embeddings.");
    }
  } else {
    console.log("Failed to generate embeddings because videoId is null.");
  }
  */

  toast.success("Summary completed!");
  setLoading(false);
  console.log("Summary completed!", summary);

  incrementCounter('summary'); // Add this line
} catch (err) {
  // This catch block will handle any errors that occur in the try block
  console.error("An error occurred during file summary generation:", err);
  toast.error("An error occurred while processing your file. Please try again.");
  setSpinner(false); // Stop loading when an error occurs
}
};


  const generateFileSummary = async (e: any, overLimit: boolean, loading: boolean, checkingApiUsage: boolean) => {
  e.preventDefault();

  if (loading || checkingApiUsage) {
    // Handle loading state, e.g., show loading spinner
    toast.info("Checking your usage limits. Please wait...");
    return;
  } else if (overLimit) {
    toast.error("You have reached your usage limit for generating summaries from files. Please try again later.");
    return;
  }
  
    if (!fileRef.current) {
      toast.error("Please upload a file");
      return;
    }
  
    const currentFile = fileRef.current?.files?.[0];
    if (!currentFile) {
      toast.error("Please upload a file");
      return;
    }
  
    const validTypes = ['audio/mp3', 'video/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm'];
    if (!validTypes.includes(currentFile.type)) {
      toast.error("Invalid file type. Please upload a valid audio/video file.");
      return;
    }

    
  
    setStart(true);
    setSummary("");
    setLoading(true);
    setSpinner(true);
  
    const formData = new FormData();
    formData.append("model", "tiny");
    formData.append("use_sse", "true");
    formData.append("file", currentFile);
    const videoId = uuidv4();
    formData.append("url", videoId);

    try {
      const responseVideoID = await fetch("/api/saveVideoID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: videoId,
          uid: uid,
          videoName: videoName,
        }),
      });

      if (!responseVideoID.ok) {
        toast.success("Video Re. Please allow time for the file to be sent.");
        throw new Error(responseVideoID.statusText);
      }
    } catch (err) {
      console.log("Error while saving VideoID: ", err);
    }
    
  
    const response = await fetch("https://brilliant-panda-production.up.railway.app/transcribe_file", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorMessage = `Error generating transcript: ${response.statusText}`;
      toast.error(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    } else {
      toast.success("Video Recieved. Please allow time for the file to be sent.");
    }
    
    const className = classRef.current?.value;  // Make sure to create this ref

    try {
      const userRef = doc(db, "users", uid);   // Reference to the user document
      const userDoc = await getDoc(userRef);   // Get the user document
    
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userClasses = userData.classes || {};  // Get the classes object
    
        // If className and videoId are defined, add them to the userClasses object
        if (className && videoId) {
          if (userClasses[className]) {
            userClasses[className].push(videoId);
          } else {
            userClasses[className] = [videoId];
          }
    
          // Update the user document
          await updateDoc(userRef, { classes: userClasses });
        } 
      } else {
        // Handle the case where the user document doesn't exist
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error writing document: ", error);
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
          setSummary((prev) => {
            if (prev === "") {
              setSpinner(false); // Stop loading when text output begins
            }
            return prev + text;
          });
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
    incrementCounter('fileSummary'); // Add this line
  };

  const handleProcessing = () => {
    const url = urlRef.current?.value;
    const file = fileRef.current?.files?.[0];
    const videoNameValue = videoNameRef.current?.value;
  
    const syntheticEvent = { preventDefault: () => {} };
  
    if (file && !videoNameValue) {
      toast.error("Please provide a video name for the uploaded file.");
      return;
    }
  
    if (url) {
      generateSummary(syntheticEvent, summaryRestriction.overLimit, summaryRestriction.loading, summaryRestriction.checkingApiUsage);
    } else if (file) {
      generateFileSummary(syntheticEvent, fileSummaryRestriction.overLimit, fileSummaryRestriction.loading, fileSummaryRestriction.checkingApiUsage);
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
    /*
    if (videoId) {
      const embeddings = await generateEmbeddings(summary, videoId);
      if (embeddings) {
        // Save embeddings to your database along with videoId
        // This will be done in your server-side code
        console.log("Embeddings generated:", embeddings);
      } else {
        console.log("Failed to generate embeddings.");
      }
    } else {
      console.log("Failed to generate embeddings because videoId is null.");
    }
    */

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
/*
  const generateEmbeddings = async (text: string, videoId: string) => {
    try {
      const response = await fetch("/api/generateEmbeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });
  
      if (!response.ok) {
        console.log("Error generating embeddings: ", response.statusText);
        return null;
      }
  
      const data = await response.json();
      const embeddings = data.embeddings; // Assuming the embeddings are returned under the key 'embeddings'
  
      const saveResponse = await fetch('/api/saveEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId: videoId, embeddings: embeddings })
      });
  
      if (!saveResponse.ok) {
        console.log("Error saving embeddings: ", saveResponse.statusText);
        return null;
      }
  
      return embeddings;
    } catch (err) {
      console.log("Error while generating embeddings: ", err);
      return null;
    }
  };
*/

const SummaryRenderer = React.memo(({ summary }: SummaryRendererProps) => (
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
));

  return (
    <div className={`flex flex-col text-center ${darkMode ? 'bg-darker-blue' : 'bg-white'}`}>
      <div className={darkMode ? 'text-neutral-white border-neutral-white bg-darker-blue' : 'text-primary-black border-primary-black bg-white'}>
        <ToastContainer />
        <div className="mx-auto lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
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
                  {spinner && (
                    <div 
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            zIndex: 50, 
                        }}
                    >
                        <div className="bg-transparent p-5 rounded-lg flex items-center flex-col">
                            <Dna
                                visible={true}
                                height="80"
                                width="80"
                                ariaLabel="dna-loading"
                                wrapperStyle={{}}
                                wrapperClass="dna-wrapper"
                            />
                              <span 
                                  className="text-lg font-medium mt-3"
                                  style={{ textShadow: '2px 2px 2px rgba(0, 0, 0, 1)' }}>
                                  Processing... Please allow time <br/> for the video to be sent and transcribed
                              </span>                        
                              </div>
                    </div>
                )}
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
                <div className="relative">
                <label htmlFor="file" className={`absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium ${darkMode ? 'text-gray-900' : 'text-gray-900'}`}>
                      Class Name
                  </label>
                  <input
                    type="text"
                    name="class"
                    id="class"
                    ref={classRef}
                    size={40}
                    className={`block w-full rounded-md border-0 py-1.5 ${darkMode ? 'text-gray-900' : 'text-gray-900'} shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 lg:text-base`}
                    placeholder="Enter Class Name"
                    value={classInput}
                    onChange={handleClassInputChange}
                />
                 {classSuggestions.map((suggestion) => (
                  <div 
                  key={suggestion} 
                  onClick={() => setClassInput(suggestion)}
                  className={`bg-white text-gray-900 py-1 px-2 cursor-pointer hover:bg-gray-200`}
                >
                  {suggestion}
                </div>
              ))}
              <div className="relative">
                <label htmlFor="videoName" className={`absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium ${darkMode ? 'text-gray-900' : 'text-gray-900'}`}>
                  Video Name
                </label>
                <input
                  type="text"
                  name="videoName"
                  id="videoName"
                  ref={videoNameRef}
                  size={40}
                  className={`block w-full rounded-md border-0 py-1.5 ${darkMode ? 'text-gray-900' : 'text-gray-900'} shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 lg:text-base`}
                  placeholder="Enter Video Name"
                  value={videoName}
                  onChange={(e) => setVideoName(e.target.value)}
                />
              </div>
              </div>
               <button
                onClick={handleProcessing}
                disabled={loading || spinner} // Disable button when loading or spinner is active
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
            <article className={`prose prose-red w-full border-red-100 mx-auto px-3 lg:px-0 ${darkMode ? 'text-neutral-white bg-darker-blue' : 'text-primary-black bg-white'}`}>
            <div className="parent-component" style={{display: 'outside', justifyContent: 'center', overflow: 'hidden'}}>
                <div className="summary-output" style={{textAlign: 'justify'}}>
                <SummaryRenderer summary={summary} />
              </div>
            </div>
            </article>
            <Divider summary={summary} url={url} shortenFn={generateShorten} darkMode={darkMode} />
          </>)
          : null}
      </div>
  </div>
  );
};