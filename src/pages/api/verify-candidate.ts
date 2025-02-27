import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mockelloId } = req.query;

    if (!mockelloId) {
      return res.status(400).json({ message: 'Mockello ID is required' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if candidate exists
    const candidate = await db.collection('candidates').findOne({ mockelloId });
    
    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found. Please create your profile by uploading your resume in the Resume Parser section.'
      });
    }

    return res.status(200).json({ 
      message: 'Candidate verified successfully',
      candidate: {
        fullName: candidate.fullName,
        email: candidate.email,
        mockelloId: candidate.mockelloId
      }
    });
  } catch (error) {
    console.error('Error in verify-candidate API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 