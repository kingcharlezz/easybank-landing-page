import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError, AxiosResponse } from 'axios';

const RapidAPI_KEY = "621ba29a80msh9607378170e54fbp1aa864jsna3a6c141be2e";
const RapidAPI_HOST = "zerogpt.p.rapidapi.com";

interface RapidApiRequest {
  input_text: string;
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { input_text }: RapidApiRequest = req.body;

      const options = {
        method: 'POST',
        url: 'https://zerogpt.p.rapidapi.com/api/v1/detectText',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': RapidAPI_KEY,
          'X-RapidAPI-Host': RapidAPI_HOST
        },
        data: {
          input_text
        }
      };

      const response: AxiosResponse<RapidApiResponse> = await axios.request(options);

      return res.status(200).json(response.data);
    } catch (error) {
      const axiosError = error as AxiosError; // typecast the error to AxiosError
      console.error('API error:', axiosError.response?.data || axiosError.message);
      return res.status(axiosError.response?.status || 500).json(axiosError.response?.data || { message: 'An error occurred during text analysis.' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
