import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const companyEmail = req.query.companyEmail;
  if (!companyEmail || typeof companyEmail !== 'string') {
    return res.status(400).json({ message: 'Company email is required' });
  }

  const client = await MongoClient.connect(uri);
  const db = client.db('mockello');

  try {
    // Delete all applications for the company
    const result = await db.collection('job_applications').deleteMany({
      companyEmail: companyEmail as string
    });

    await client.close();

    return res.status(200).json({
      message: 'Candidate pool reset successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error resetting candidate pool:', error);
    await client.close();
    return res.status(500).json({ message: 'Failed to reset candidate pool' });
  }
} 