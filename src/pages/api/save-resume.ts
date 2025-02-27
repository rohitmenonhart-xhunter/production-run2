import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mockello');
    const collection = db.collection('resumes');

    const resumeData = req.body;
    resumeData.createdAt = new Date();

    const result = await collection.insertOne(resumeData);

    return res.status(201).json({ 
      message: 'Resume saved successfully',
      resumeId: result.insertedId 
    });
  } catch (error) {
    console.error('Error saving resume:', error);
    return res.status(500).json({ message: 'Error saving resume' });
  }
} 