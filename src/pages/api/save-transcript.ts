import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection('interview_transcripts');

    const transcriptData = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(transcriptData);

    await client.close();

    return res.status(201).json({ 
      message: 'Interview transcript saved successfully',
      transcriptId: result.insertedId 
    });
  } catch (error) {
    console.error('Error saving interview transcript:', error);
    return res.status(500).json({ message: 'Error saving interview transcript' });
  }
} 