import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

const HOST = 'svc-3031b160-473e-48f8-87f8-d2948b3cf195-dml.aws-virginia-6.svc.singlestore.com';
const USER = 'admin';
const PASSWORD = 'XGXbkb0Vd0OJfKCD705iTSnfpyzJLFAv';
const DATABASE = 'notescribe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { videoId, embeddings } = req.body;

  if (!videoId || !embeddings) {
    return res.status(400).json({ message: 'Video ID and embeddings are required' });
  }

  let dbConnection;
  try {
    dbConnection = await mysql.createConnection({
      host: HOST,
      user: USER,
      password: PASSWORD,
      database: DATABASE
    });

    const query = 'INSERT INTO embeddings (videoId, embedding) VALUES (?, ?)';
    await dbConnection.execute(query, [videoId, embeddings]);

    return res.status(200).json({ message: 'Embeddings saved successfully' });
  } catch (error) {
    console.error('Database operation failed:', error);
    return res.status(500).json({ message: 'Database operation failed' });
  } finally {
    if (dbConnection) {
      await dbConnection.end();
    }
  }
}
