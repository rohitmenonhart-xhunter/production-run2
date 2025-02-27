import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mockelloId } = req.query;

    if (!mockelloId || typeof mockelloId !== 'string') {
      return res.status(400).json({ message: 'Mockello ID is required' });
    }

    const client = await clientPromise;
    const db = client.db('mockello');

    // Get candidate data from resumes collection
    const candidate = await db.collection('resumes').findOne({ mockelloId });

    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found. Please create your profile first.',
        exists: false 
      });
    }

    // Return basic candidate info
    return res.status(200).json({
      exists: true,
      candidate: {
        mockelloId: candidate.mockelloId,
        fullName: candidate.fullName,
        email: candidate.email,
        skills: candidate.skills || [],
        experience: candidate.experience || [],
        education: candidate.education || []
      }
    });

  } catch (error) {
    console.error('Error verifying candidate:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 