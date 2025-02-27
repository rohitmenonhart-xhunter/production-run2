import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const jobId = req.query.jobId as string;
    const mockelloId = req.query.mockelloId as string;

    if (!mockelloId) {
      return res.status(400).json({ message: 'MockelloID is required' });
    }

    const application = await db.collection('job_applications').findOne({
      jobId: new ObjectId(jobId),
      candidateMockelloId: mockelloId
    });

    if (!application) {
      return res.status(200).json({ hasApplied: false });
    }

    return res.status(200).json({
      hasApplied: true,
      applicationDate: application.createdAt
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 