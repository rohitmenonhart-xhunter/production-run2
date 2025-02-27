import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    // Get all companies with their billing data
    const companies = await db.collection('companies').aggregate([
      {
        $lookup: {
          from: 'hrs',
          localField: '_id',
          foreignField: 'companyId',
          as: 'hrs'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          billingData: 1,
          hrCount: { $size: '$hrs' },
          lastUpdated: 1
        }
      }
    ]).toArray();

    return res.status(200).json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 