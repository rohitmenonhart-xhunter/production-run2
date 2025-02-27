import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { CommunityUser } from '@/types/community';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);
  const collection = db.collection<CommunityUser>('community_users');

  try {
    // Get users who were active in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const activeUsers = await collection
      .find({
        lastActiveAt: { $gte: fifteenMinutesAgo }
      })
      .sort({ lastActiveAt: -1 })
      .limit(20)
      .toArray();

    return res.status(200).json(activeUsers);
  } catch (error: any) {
    console.error('Error in active users API:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}

export async function updateActivity(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!MONGODB_URI || !MONGODB_DB) {
    return res.status(500).json({ message: 'Missing MongoDB configuration' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const usersCollection = db.collection('community_users');

    // Update user's last active timestamp
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { lastActiveAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result?.value) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Activity updated successfully' });
  } catch (error) {
    console.error('Error updating user activity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 