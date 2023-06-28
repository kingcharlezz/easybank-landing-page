import { NextApiRequest, NextApiResponse } from 'next'

export default async function createMessage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body); // To check the structure of the incoming request body
  const { temp, messages } = req.body;
  const input = messages[1].content; // Extracting input from the messages array
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';
  

  const formattedMessages = [
    { role: "system", content: "You are a professional Paraphraser. Please paraphrase the following text while keeping the purpose and meaning the same. Use high perplexity and burstiness of sentences. Also, use human-like lexical variation, so that this does not get flagged as AI Written"  },
    { role: "user", content: input }
  ];

  const body = JSON.stringify({
    messages: formattedMessages,
    model: 'gpt-3.5-turbo',
    temperature: temp,
    stream: false,
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
    res.status(200).json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
