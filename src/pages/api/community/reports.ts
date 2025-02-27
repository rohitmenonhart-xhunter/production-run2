import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'mockello';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MongoDB URI is not configured' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const reportsCollection = db.collection('community_reports');

    switch (req.method) {
      case 'POST':
        const report = {
          ...req.body,
          createdAt: new Date(),
          status: 'pending', // pending, reviewed, resolved
        };

        const result = await reportsCollection.insertOne(report);
        return res.status(201).json({ success: true, reportId: result.insertedId });

      case 'GET':
        // Only allow admins to view reports
        const reports = await reportsCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        return res.status(200).json({ reports });

      case 'PUT':
        const { reportId, status, action } = req.body;
        
        if (!reportId || !status) {
          return res.status(400).json({ error: 'Report ID and status are required' });
        }

        const updateResult = await reportsCollection.updateOne(
          { _id: new ObjectId(reportId) },
          { $set: { status, action, reviewedAt: new Date() } }
        );

        if (updateResult.modifiedCount === 0) {
          return res.status(404).json({ error: 'Report not found' });
        }

        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in reports API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
} 