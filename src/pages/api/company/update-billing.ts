import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, billingData } = req.body;
    if (!email || !billingData) {
      return res.status(400).json({ message: 'Company email and billing data are required' });
    }

    const { db } = await connectToDatabase();

    // Find the company and update its billing data
    const result = await db.collection('companies').updateOne(
      { email: email.toString() },
      { 
        $set: { 
          billingData: {
            totalSessions: billingData.totalSessions,
            totalMaxSessions: billingData.totalMaxSessions,
            totalCost: billingData.billing.totalCost,
            costPerSession: billingData.billing.costPerSession,
            lastUpdated: new Date().toISOString()
          }
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json({ 
      message: 'Billing data updated successfully',
      updatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error updating billing data:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 