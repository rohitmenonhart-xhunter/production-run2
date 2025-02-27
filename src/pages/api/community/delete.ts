import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'mockello';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MongoDB URI is not configured' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const postsCollection = db.collection('community_posts');
    const commentsCollection = db.collection('community_comments');

    const { threadId, commentId } = req.query;

    // Check if user is admin
    const storedUser = req.headers['x-user-data'];
    if (!storedUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userData = JSON.parse(storedUser as string);
    if (userData.type !== 'hr') {
      return res.status(403).json({ error: 'Only HR admins can delete threads and comments' });
    }

    if (threadId) {
      // Delete the thread and all its comments
      await commentsCollection.deleteMany({ postId: threadId });
      const result = await postsCollection.deleteOne({ _id: new ObjectId(threadId as string) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      return res.status(200).json({ message: 'Thread and all its comments deleted successfully' });
    }

    if (commentId) {
      // Delete a single comment
      const result = await commentsCollection.deleteOne({ _id: new ObjectId(commentId as string) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      
      return res.status(200).json({ message: 'Comment deleted successfully' });
    }

    return res.status(400).json({ error: 'Either threadId or commentId is required' });
  } catch (error) {
    console.error('Error deleting thread/comment:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
} 