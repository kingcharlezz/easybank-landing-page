import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; 

const FAQ = () => { 
        const questionsAndAnswers = [
    {
      question: 'How does the note-taking service work?',
      answer:
        'Our note-taking service utilizes advanced machine learning algorithms to transcribe and summarize videos. Users can upload videos or provide YouTube links, and our system will process the content, extracting key points and generating concise notes. These notes can be customized, edited, and shared, providing a seamless experience for students, professionals, and anyone looking to capture essential information from video content.',
    },
    {
      question: 'What video formats are supported?',
      answer:
        'We support a wide range of video formats, including but not limited to MP4, AVI, MOV, WMV, and FLV. Our goal is to provide flexibility to our users, allowing them to upload videos in the format that best suits their needs. If you encounter any issues with a specific format, our support team is always available to assist you.',
    },
    {
      question: 'Can I upload YouTube videos directly?',
      answer:
        "Yes, our service allows users to directly upload YouTube videos by simply providing the video's URL. Our system will then process the video, extracting the audio and visual content to generate comprehensive notes. This feature enables users to easily utilize publicly available content for educational and professional purposes.",
    },
    {
      question: 'Is there a limit to the number of videos I can upload?',
      answer:
        'Our service offers different subscription tiers to cater to various user needs. Free users have a limit of 10 Youtube Videos and 3 Uploaded Videos notes per month, while Premium Subscribers enjoy 50 Youtube Videos and 20 Uploaded videos notes per month. Please refer to our Pricing page for more detailed information on the different plans and their respective upload limits.',
    },
    {
      question: 'How are the notes generated from the videos?',
      answer:
        "The notes are generated through a combination of speech-to-text transcription and natural language processing (NLP) algorithms. First, the audio content of the video is transcribed into text. Then, our NLP algorithms analyze the text to identify key concepts, themes, and important details. The result is a set of concise and informative notes that capture the essence of the video's content.",
    },
    {
      question: 'What privacy measures are in place for uploaded videos?',
      answer:
        'We take the privacy and security of our users\' data very seriously. All uploaded videos are processed in a secure environment, and access is restricted to authorized personnel only. Videos are used solely for the purpose of generating notes and are not shared with third parties.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-8 mt-20 flex-grow"> {/* Add flex-grow */}
        <h1 className="text-4xl font-bold mb-10 text-center">FAQ</h1>
        {questionsAndAnswers.map((item, index) => (
          <Accordion key={index} className="mb-6">
            <AccordionSummary
              expandIcon={<KeyboardArrowDownIcon />} // Use the new icon
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h5">{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
