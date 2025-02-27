import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mockelloId } = req.query;

  if (!mockelloId) {
    return res.status(400).json({ message: 'MockelloID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mockello');
    const collection = db.collection('resumes');

    const result = await collection.findOne(
      { mockelloId: mockelloId },
      { projection: { analysis: 1, _id: 0 } }
    );

    if (!result) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ message: 'Error fetching analysis' });
  }
} 