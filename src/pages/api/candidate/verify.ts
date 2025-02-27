import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const resumes = db.collection('resumes');

    // POST - Verify MockelloID
    if (req.method === 'POST') {
      const { mockelloId } = req.body;

      if (!mockelloId) {
        return res.status(400).json({ message: 'MockelloID is required' });
      }

      // Find candidate with the given MockelloID in resumes collection
      const candidate = await resumes.findOne({ mockelloId });
      
      if (!candidate) {
        return res.status(404).json({ 
          message: 'Invalid MockelloID. Please make sure you have uploaded your resume first.'
        });
      }

      // Return minimal candidate info
      return res.status(200).json({
        verified: true,
        candidate: {
          mockelloId: candidate.mockelloId,
          name: candidate.fullName,
          email: candidate.email
        }
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error verifying candidate:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 