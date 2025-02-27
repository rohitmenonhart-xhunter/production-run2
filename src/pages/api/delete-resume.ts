import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mockello');
    const collection = db.collection('resumes');

    // Find and delete all records with the given phone number
    const result = await collection.deleteMany({ phone: phone });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No records found with this phone number' });
    }

    res.status(200).json({ message: `Deleted ${result.deletedCount} record(s)` });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
} 