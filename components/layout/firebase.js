import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAV6SBt7Ptnar-2ClKvlH1qyiMjb9i0r5w",
  authDomain: "notescribe-6867a.firebaseapp.com",
  projectId: "notescribe-6867a",
  storageBucket: "notescribe-6867a.appspot.com",
  messagingSenderId: "38833832302",
  appId: "1:38833832302:web:41385c0a187cfd86a0017f",
  measurementId: "G-7LSM15R6NS"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // if already initialized, use that one
}

let analytics;
if (typeof window !== "undefined") {
  // This means we're in the browser
  analytics = getAnalytics(app);
}

export const auth = getAuth();
