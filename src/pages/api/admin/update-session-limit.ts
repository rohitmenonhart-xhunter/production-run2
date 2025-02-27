import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { companyId, newLimit } = req.body;

    if (!companyId || typeof newLimit !== 'number') {
      return res.status(400).json({ message: 'Company ID and new limit are required' });
    }

    const { db } = await connectToDatabase();

    // Get company's HR count
    const company = await db.collection('companies').findOne({ 
      _id: new ObjectId(companyId) 
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all HRs for this company
    const hrs = await db.collection('hrs').find({ 
      companyId: new ObjectId(companyId) 
    }).toArray();

    const hrCount = hrs.length;
    const limitPerHR = Math.floor(newLimit / hrCount); // Distribute limit evenly

    // Update company's total session limit
    await db.collection('companies').updateOne(
      { _id: new ObjectId(companyId) },
      {
        $set: {
          'billingData.totalMaxSessions': newLimit,
          lastUpdated: new Date().toISOString()
        }
      }
    );

    // Update each HR's session limit
    await Promise.all(hrs.map(hr => 
      db.collection('hrs').updateOne(
        { _id: hr._id },
        {
          $set: {
            maxSessions: limitPerHR,
            lastUpdated: new Date().toISOString()
          }
        }
      )
    ));

    return res.status(200).json({ 
      message: 'Session limit updated successfully',
      totalLimit: newLimit,
      limitPerHR,
      hrCount
    });
  } catch (error) {
    console.error('Error updating session limit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 