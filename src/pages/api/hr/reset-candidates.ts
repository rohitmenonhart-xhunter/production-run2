import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { hrId } = req.body;
  if (!hrId) {
    return res.status(400).json({ message: 'HR ID is required' });
  }

  console.log('[reset-candidates] Starting reset for HR:', hrId);
  
  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const hrs = db.collection('hrs');

    // Find HR and reset their assigned candidates
    console.log('[reset-candidates] Looking for HR with ID:', hrId);
    const result = await hrs.updateOne(
      { 
        $or: [
          { _id: new ObjectId(hrId) },
          { uniqueId: `HR_${hrId}` }
        ]
      },
      { 
        $set: { assignedCandidates: [] }
      }
    );
    
    console.log('[reset-candidates] Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'HR not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'No changes made' });
    }

    return res.status(200).json({ 
      message: 'Successfully reset assigned candidates',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('[reset-candidates] Error in handler:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 