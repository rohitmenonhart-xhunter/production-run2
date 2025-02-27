import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'mockello';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MongoDB URI is not configured' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const usersCollection = db.collection('community_users');
    const postsCollection = db.collection('community_posts');

    // Get total members
    const totalMembers = await usersCollection.countDocuments();

    // Get online users (active in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlineUsers = await usersCollection.countDocuments({
      lastActiveAt: { $gte: fifteenMinutesAgo }
    });

    // Get active HR professionals
    const activeHR = await usersCollection.countDocuments({
      type: 'hr',
      lastActiveAt: { $gte: fifteenMinutesAgo }
    });

    // Get posts created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const postsToday = await postsCollection.countDocuments({
      createdAt: { $gte: today }
    });

    return res.status(200).json({
      totalMembers,
      onlineUsers,
      activeHR,
      postsToday
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
} 