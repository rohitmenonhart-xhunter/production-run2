import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { CommunityPost } from '@/types/community';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'mockello';

interface MongoPost extends Omit<CommunityPost, '_id'> {
  _id?: ObjectId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'Missing MongoDB URI' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const postsCollection = db.collection<MongoPost>('community_posts');
    const commentsCollection = db.collection('community_comments');

    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          try {
            // Validate ObjectId
            if (!ObjectId.isValid(req.query.id as string)) {
              return res.status(400).json({ error: 'Invalid post ID format' });
            }

            // Get single post
            const post = await postsCollection.findOne({ 
              _id: new ObjectId(req.query.id as string) 
            });
            
            if (!post) {
              return res.status(404).json({ error: 'Post not found' });
            }
            
            // Get comment count
            const commentCount = await commentsCollection.countDocuments({ 
              postId: new ObjectId(req.query.id as string) 
            });

            return res.status(200).json({ 
              ...post, 
              _id: post._id.toString(), // Ensure ID is a string
              commentCount 
            });
          } catch (error) {
            console.error('Error fetching single post:', error);
            return res.status(500).json({ error: 'Failed to fetch post' });
          }
        } else {
          try {
            // Get all posts with pagination
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
            const skip = (page - 1) * limit;
            
            const posts = await postsCollection
              .find({})
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .toArray();

            // Get comment counts for all posts
            const postsWithComments = await Promise.all(
              posts.map(async (post) => {
                const commentCount = await commentsCollection.countDocuments({ 
                  postId: post._id 
                });
                return { 
                  ...post, 
                  _id: post._id.toString(), // Ensure ID is a string
                  commentCount 
                };
              })
            );
              
            const total = await postsCollection.countDocuments();
            return res.status(200).json({ 
              posts: postsWithComments, 
              total, 
              page, 
              totalPages: Math.ceil(total / limit) 
            });
          } catch (error) {
            console.error('Error fetching posts:', error);
            return res.status(500).json({ error: 'Failed to fetch posts' });
          }
        }

      case 'POST':
        // Create new post
        const newPost: Omit<CommunityPost, '_id'> = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
          upvotes: 0,
          commentCount: 0
        };
        const result = await postsCollection.insertOne(newPost);
        return res.status(201).json({ ...newPost, _id: result.insertedId.toString() });

      case 'PUT':
        // Update post
        const { _id, ...updateData } = req.body;
        const updatedPost = await postsCollection.findOneAndUpdate(
          { _id: new ObjectId(_id) },
          { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            } 
          },
          { returnDocument: 'after' }
        );
        if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
        return res.status(200).json(updatedPost);

      case 'DELETE':
        // Delete post
        const deletedPost = await postsCollection.findOneAndDelete({ _id: new ObjectId(req.query.id as string) });
        if (!deletedPost) return res.status(404).json({ error: 'Post not found' });
        return res.status(200).json({ message: 'Post deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Error in community posts API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.close();
  }
} 