import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

interface VoteRecord {
  userId: string;
  postId: string;
  voteType: 'up' | 'down';
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!MONGODB_URI || !MONGODB_DB) {
    return res.status(500).json({ message: 'Missing MongoDB configuration' });
  }

  const { postId, userId, voteType } = req.body;

  if (!postId || !userId || !voteType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const postsCollection = db.collection('community_posts');
    const votesCollection = db.collection('community_votes');

    // Check if user has already voted
    const existingVote = await votesCollection.findOne({
      userId,
      postId: new ObjectId(postId)
    });

    let voteChange = 0;
    let userVote: 'up' | 'down' | null = null;

    if (existingVote) {
      // Remove existing vote
      await votesCollection.deleteOne({
        userId,
        postId: new ObjectId(postId)
      });

      // If user is changing their vote
      if (existingVote.voteType !== voteType) {
        // Add new vote
        await votesCollection.insertOne({
          userId,
          postId: new ObjectId(postId),
          voteType,
          createdAt: new Date()
        });

        voteChange = voteType === 'up' ? 2 : -2; // +2 for up->down, -2 for down->up
        userVote = voteType;
      } else {
        // User is removing their vote
        voteChange = voteType === 'up' ? -1 : 1;
        userVote = null;
      }
    } else {
      // Add new vote
      await votesCollection.insertOne({
        userId,
        postId: new ObjectId(postId),
        voteType,
        createdAt: new Date()
      });

      voteChange = voteType === 'up' ? 1 : -1;
      userVote = voteType;
    }

    // Update post vote count
    const updatedPost = await postsCollection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $inc: { upvotes: voteChange } },
      { returnDocument: 'after' }
    );

    if (!updatedPost?.value) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({
      post: updatedPost.value,
      userVote
    });
  } catch (error) {
    console.error('Error handling vote:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 