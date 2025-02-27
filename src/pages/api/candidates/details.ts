import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mockelloId } = req.query;
  if (!mockelloId) {
    return res.status(400).json({ message: 'Mockello ID is required' });
  }

  console.log('Fetching candidate details for Mockello ID:', mockelloId);

  let client: MongoClient | null = null;

  try {
    client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const resumes = db.collection('resumes');

    // Find the complete candidate data from resumes collection
    const candidate = await resumes.findOne({ mockelloId: mockelloId });
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Return all the candidate data directly
    return res.status(200).json({ 
      candidate: {
        _id: candidate._id,
        mockelloId: candidate.mockelloId,
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        education: candidate.education || [],
        experience: candidate.experience || [],
        skills: candidate.skills || [],
        projects: candidate.projects || [],
        achievements: candidate.achievements || [],
        interests: candidate.interests || [],
        analysis: candidate.analysis || ''
      } 
    });

  } catch (error: any) {
    console.error('Error fetching candidate details:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message || 'Unknown error occurred'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 