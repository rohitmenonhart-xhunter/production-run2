import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { CommunityComment } from '@/types/community';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'mockello';

interface MongoComment extends Omit<CommunityComment, '_id' | 'postId'> {
  _id?: ObjectId;
  postId: ObjectId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'Missing MongoDB URI' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection<MongoComment>('community_comments');

    if (req.method === 'GET') {
      if (req.query.id) {
        const comment = await collection.findOne({ 
          _id: new ObjectId(req.query.id as string) 
        });
        
        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        return res.status(200).json({
          ...comment,
          _id: comment._id.toString(),
          postId: comment.postId.toString()
        });
      } else if (req.query.postId) {
        try {
          // Validate ObjectId
          if (!ObjectId.isValid(req.query.postId as string)) {
            return res.status(400).json({ error: 'Invalid post ID format' });
          }

          // Get all comments for a post
          const comments = await collection
            .find({ postId: new ObjectId(req.query.postId as string) })
            .sort({ createdAt: -1 })
            .toArray();

          // Convert ObjectIds to strings
          const formattedComments = comments.map(comment => ({
            ...comment,
            _id: comment._id.toString(),
            postId: comment.postId.toString(),
            parentCommentId: comment.parentCommentId?.toString()
          }));

          return res.status(200).json(formattedComments);
        } catch (error) {
          console.error('Error fetching comments:', error);
          return res.status(500).json({ error: 'Failed to fetch comments' });
        }
      } else {
        return res.status(400).json({ error: 'Post ID is required' });
      }
    } else if (req.method === 'POST') {
      const { postId, ...commentData } = req.body;
      const newComment = {
        ...commentData,
        postId: new ObjectId(postId),
        createdAt: new Date(),
        updatedAt: new Date(),
        upvotes: 0
      };

      const result = await collection.insertOne(newComment);
      return res.status(201).json({ 
        ...newComment, 
        _id: result.insertedId.toString(),
        postId: newComment.postId.toString()
      });
    } else if (req.method === 'PUT') {
      // Update comment
      const { _id, ...updateData } = req.body;
      const updatedComment = await collection.findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      if (!updatedComment) return res.status(404).json({ error: 'Comment not found' });
      return res.status(200).json(updatedComment);
    } else if (req.method === 'DELETE') {
      // Delete comment
      const deletedComment = await collection.findOneAndDelete({ _id: new ObjectId(req.query.id as string) });
      if (!deletedComment) return res.status(404).json({ error: 'Comment not found' });
      return res.status(200).json({ message: 'Comment deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Error in community comments API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 