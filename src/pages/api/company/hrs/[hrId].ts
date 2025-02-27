import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hrId } = req.query;
  if (!hrId || typeof hrId !== 'string') {
    return res.status(400).json({ message: 'HR ID is required' });
  }

  const client = await MongoClient.connect(uri);
  const db = client.db('mockello');
  const hrs = db.collection('hrs');

  try {
    switch (req.method) {
      case 'DELETE':
        // Delete HR
        const deleteResult = await hrs.deleteOne({ _id: new ObjectId(hrId) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'HR not found' });
        }
        
        return res.status(200).json({ message: 'HR deleted successfully' });

      case 'POST':
        // Handle candidate assignment
        if (req.url?.includes('/assign')) {
          const { candidateIds } = req.body;
          
          if (!Array.isArray(candidateIds)) {
            return res.status(400).json({ message: 'Candidate IDs must be an array' });
          }

          const updateResult = await hrs.updateOne(
            { _id: new ObjectId(hrId) },
            { 
              $set: { 
                assignedCandidates: candidateIds,
                updatedAt: new Date()
              }
            }
          );

          if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'HR not found' });
          }

          return res.status(200).json({ message: 'Candidates assigned successfully' });
        }

        return res.status(404).json({ message: 'Invalid endpoint' });

      default:
        res.setHeader('Allow', ['DELETE', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in HR operations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 