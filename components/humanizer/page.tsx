import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from 'react-query';
import axios, { AxiosError } from 'axios';
import { NextPage } from 'next';

const GPTZero_API_KEY = "caa06262ea9c4815813fa8803085386a";
const TEMP_INCREMENT = 0.2;
const MAX_TEMP = 1.81;
const TOP_P_INCREMENT = 0.019;
const MAX_TOP_P = 1.0;

const TextAnalyzer: NextPage = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [temp, setTemp] = useState(1.0);
    const [top_p, setTopP] = useState(0.99);
    const [shouldRegenerate, setShouldRegenerate] = useState(false);
    const [isInitialRequest, setIsInitialRequest] = useState(true);
    const [lastSubmittedText, setLastSubmittedText] = useState('');

    const generateMutation = useMutation(
        async ({ temp, top_p, input }: { temp: number; top_p: number; input: string; }) => {
            let systemMessage = isInitialRequest 
                ? "You are a professional Paraphraser. Please paraphrase the following text while keeping the purpose and meaning the same. Please also use human-like lexical variation, so that this does not get flagged as AI Written"
                : "Paraphrase the text again with higher perplexity and burstiness. Your goal is to make it not sound like an AI wrote this, so use high lexical variation and Vary sentence structure.";
            const response = await axios.post(
                '/api/humanize_route',
                {
                    model: "gpt-3.5-turbo-16k",
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: input }
                    ],
                    options: {
                        temperature: temp,
                        top_p: top_p,
                    }
                },
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                console.log('API response:', data);
                if (data?.data?.choices?.[0]?.message?.content) {
                    let paraphrasedText = data.data.choices[0].message.content;
                    setInput(paraphrasedText);
                    analyzeMutation.mutate({ document: paraphrasedText, temp, top_p });
                    setIsInitialRequest(false);
                } else {
                    console.error('Unexpected API response structure');
                    setOutput('An error occurred during text generation.');
                }
            },
            onError: (error) => {
                console.log(error);
                setOutput('An error occurred during text generation.');
            }        
        }
    );

    const analyzeMutation = useMutation(
        async ({ document, temp, top_p }: { document: string; temp: number; top_p: number }) => {
            try {
                setLastSubmittedText(input); // Store the last submitted input
                console.log(document);
                const response = await axios({
                    method: 'POST',
                    url: 'https://api.gptzero.me/v2/predict/text',
                    headers: {
                        'x-api-key': GPTZero_API_KEY,
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    data: { document, version: '2023-06-12' }
                });
                return response.data;
            } catch (error) {
                const axiosError = error as AxiosError; // typecast the error to AxiosError
                console.error('There was an error with the axios request:', axiosError);
                if (axiosError.response) {
                    console.error('Response data:', axiosError.response.data);
                    console.error('Response status:', axiosError.response.status);
                    console.error('Response headers:', axiosError.response.headers);
                } else if (axiosError.request) {
                    console.error('No response received:', axiosError.request);
                } else {
                    console.error('Error', axiosError.message);
                }
                console.error('Error config:', axiosError.config);
                throw axiosError; // Re-throw the error so the mutation.onError can handle it
            }
        },
        
        {
            onSuccess: (response) => {
                if (!response?.documents[0]?.document_classification) {
                    console.error('Unexpected response structure:', response);
                    return;
                }
            
                const { data } = response;
                console.log(data);
            
                const classification = response.documents[0].document_classification;
            
                if (classification === 'HUMAN_ONLY') {
                    let generatedText = lastSubmittedText;
                    console.log("Text is human-like");
                    setOutput(generatedText);
                } else {
                    const newTemp = Math.min(MAX_TEMP, temp + TEMP_INCREMENT);
                    const newTopP = Math.min(MAX_TOP_P, top_p + TOP_P_INCREMENT);
    
                    if (newTemp < MAX_TEMP && newTopP < MAX_TOP_P) {
                        setTemp(newTemp);
                        setTopP(newTopP);
                        setShouldRegenerate(true);
                    } else {
                        setOutput('Unable to generate human-like text.');
                    }
                }
            },
            onError: (error: AxiosError) => {
                console.error('Axios Error:', error);
                if (error.response) {
                    console.error('Response:', error.response);
                } else if (error.request) {
                    console.error('Request:', error.request);
                } else {
                    console.error('Other Error:', error.message);
                }
                setOutput('An error occurred during text analysis.');
            }
        },
    );
    
    useEffect(() => {
        if (shouldRegenerate) {
            generateMutation.mutate({ temp, top_p, input });
            setShouldRegenerate(false);
        }
    }, [shouldRegenerate, temp, top_p, input, generateMutation]);

    const handleAnalyzeClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(input);  
        generateMutation.mutate({ temp, top_p, input });
    };

    return (
        <div>
            <form onSubmit={handleAnalyzeClick}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} />
                <button type="submit">Analyze and Generate</button>
            </form>
            {output && <div><textarea readOnly value={output} /></div>}
        </div>
    );
};

const queryClient = new QueryClient();

const TextAnalyzerPage: NextPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TextAnalyzer />
    </QueryClientProvider>
  );
}

export default TextAnalyzerPage;
