import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body); // To check the structure of the incoming request body
  const { text } = req.body; // Extracting text from the request body
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/embeddings';

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const body = JSON.stringify({
    input: text,
    model: 'text-embedding-ada-002',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });
    const data = await response.json();
    const embedding = data.data[0].embedding;  // Extract the embedding array
    res.status(200).json({ embeddings: embedding });
  } catch (error: any) {
    console.error('OpenAI API call failed:', error);
    res.status(500).json({ error: error.message });
  }
}
