import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { CommunityPost } from '@/types/community';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MongoDB URI is not defined' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);
  const postsCollection = db.collection<CommunityPost>('community_posts');

  try {
    // Aggregate tags and their counts from all posts
    const tagCounts = await postsCollection.aggregate([
      // Unwind the tags array to create a document for each tag
      { $unwind: '$tags' },
      // Group by tag and count occurrences
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      // Sort by count in descending order
      { $sort: { count: -1 } },
      // Limit to top 10 tags
      { $limit: 10 },
      // Project to desired output format
      {
        $project: {
          _id: 0,
          tag: '$_id',
          count: 1
        }
      }
    ]).toArray();

    return res.status(200).json(tagCounts);
  } catch (error: any) {
    console.error('Error in popular tags API:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
} 