import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from 'react-query';
import axios, { AxiosError } from 'axios';
import { NextPage } from 'next';

const source = axios.CancelToken.source();
const TEMP_INCREMENT = 0.2;
const MAX_TEMP = 1.81;
const TOP_P_INCREMENT = 0.019;
const MAX_TOP_P = 1.0;

interface Sentence {
  sentence: string;
  perplexity: number;
  generated_prob: number;
  highlight_sentence_for_ai: boolean;
}

interface Paragraph {
  start_sentence_index: number;
  num_sentences: number;
  completely_generated_prob: number;
}

interface Document {
  average_generated_prob: number;
  completely_generated_prob: number;
  overall_burstiness: number;
  sentences: Sentence[];
  paragraphs: Paragraph[];
  result_message: string;
  document_classification: string;
}


interface RapidApiResponse {
  success: boolean;
  data: {
    is_human_written: number;
    is_gpt_generated: number;
    feedback_message: string;
    gpt_generated_sentences: string[];
    words_count: number;
  };
}

const TextAnalyzer: NextPage = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [temp, setTemp] = useState(1.1);
    const [top_p, setTopP] = useState(0.99);
    const [shouldRegenerate, setShouldRegenerate] = useState(false);
    const [isInitialRequest, setIsInitialRequest] = useState(true);
    const [lastSubmittedText, setLastSubmittedText] = useState('');
    const [responseText, setResponseText] = useState('');

    const generateMutation = useMutation(
        async ({ temp, top_p, input }: { temp: number; top_p: number; input: string; }) => {
            let systemMessage = isInitialRequest 
                ? "Your task is to paraphrase the following text in a way that avoids looking AI detection. This means you should:\n1. Maintain the semantic meaning of the original text.\n2. Use the context of the surrounding sentences to inform your paraphrase.\n3. Introduce both lexical (word choice) and syntactic (sentence structure) diversity.\n4. Try to paraphrase multiple sentences at once, if possible.\n5. Avoid changing proper names or omitting important content."
                :  "Your task is to paraphrase the following text in a way that avoids looking AI detection. This means you should:\n1. Maintain the semantic meaning of the original text.\n2. Use the context of the surrounding sentences to inform your paraphrase.\n3. Introduce both lexical (word choice) and syntactic (sentence structure) diversity.\n4. Try to paraphrase multiple sentences at once, if possible.\n5. Avoid changing proper names or omitting important content."

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
                  {
                      cancelToken: source.token
                  },
              );
            return response.data;
        },
        {
            onSuccess: (data) => {
                console.log('API response:', data);
                if (data?.data?.choices?.[0]?.message?.content) {
                  let paraphrasedText = data.data.choices[0].message.content;
                  setResponseText(paraphrasedText);
                  analyzeMutation.mutate({ input_text_from_user: paraphrasedText });
                  setIsInitialRequest(false);
                } else {
                  console.error('Unexpected API response structure');
                  setOutput('An error occurred during text generation.');
                }
            },
            onError: (error: AxiosError) => {
                console.error('API error:', error.response?.data || error.message);
                setOutput('An error occurred during text generation.');
            },
        },
    );

    const analyzeMutation = useMutation(
      async ({ input_text_from_user }: { input_text_from_user: string; }) => {
        const response = await axios.post(
          '/api/analyze_route',
          {
            input_text : input_text_from_user,
          },
          {
              cancelToken: source.token
          },
      );
          return response.data;
      },
      {
          onSuccess: (response: RapidApiResponse) => {
              console.log('Full response:', response);
              console.log('Response data:', response.data);
  
              if (response.success) {
                  if (response.data.is_gpt_generated < 20) {
                      setOutput(responseText);
                  } else {
                      setShouldRegenerate(true);
                  }
              } else {
                  console.error('API response marked as unsuccessful');
                  setOutput('An error occurred during text analysis.');
              }
          },
          onError: (error: AxiosError) => {
              console.error('API error:', error.response?.data || error.message);
              setOutput('An error occurred during text analysis.');
          },
      },
  );

    useEffect(() => {
        if (shouldRegenerate) {
            if (temp < MAX_TEMP) {
                setTemp((oldTemp) => oldTemp + TEMP_INCREMENT);
            } else if (top_p < MAX_TOP_P) {
                setTopP((oldTopP) => oldTopP + TOP_P_INCREMENT);
            }
            setShouldRegenerate(false);
            generateMutation.mutate({ temp, top_p, input });
        }
    }, [shouldRegenerate, temp, top_p, input, generateMutation]);

    const handleAnalyzeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (input !== lastSubmittedText) {
            setLastSubmittedText(input);
            generateMutation.mutate({ temp, top_p, input });
        } else {
            setShouldRegenerate(true);
        }
    };

    useEffect(() => {
      return () => {
          source.cancel('Component unmounted and request cancelled');
      }
  }, []);

    return (
        <div>
            <form>
                <label>
                    Input:
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} />
                </label>
                <button onClick={handleAnalyzeClick}>
                    Analyze
                </button>
            </form>
            <div>
                Output:
                <textarea value={output} disabled />
            </div>
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