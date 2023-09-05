import { useEffect } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Footer from '../components/layout/Footer';

const Home: NextPage = () => {
  useEffect(() => {
    document.body.style.backgroundColor = '';
  }, []);

  return (
    <>
      <Head>
        <title>NoteScribe</title>
        <link rel="icon" href="/favicon-32x32.png" />
        <link rel="canonical" href="https://notescribe.ai/" />
        <meta name="description" content="Discover NoteScribe, an AI-powered platform that revolutionizes learning by converting uploaded files and YouTube videos into comprehensive notes, making the need to physically attend classes a thing of the past. With NoteScribe, students can enjoy an enriched, flexible learning journey right from the comfort of their home, breaking away from traditional classroom constraints" />
      </Head>
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="hidden lg:block w-full h-full absolute">
          <div className="bg-image-mockups absolute z-20 w-full h-full bg-no-repeat bg-right-top -right-72 xl:-right-28"></div>
        </div>
        <Hero />
      </div>
      <Footer />
    </>
  );
};

export default Home;
