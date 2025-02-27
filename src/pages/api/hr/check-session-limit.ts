import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hrId } = req.body;

    if (!hrId) {
      return res.status(400).json({ message: 'HR ID is required' });
    }

    const { db } = await connectToDatabase();

    // Get HR data with company info
    const hr = await db.collection('hrs').findOne({ 
      _id: new ObjectId(hrId) 
    });

    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    // Get company data
    const company = await db.collection('companies').findOne({ 
      _id: new ObjectId(hr.companyId) 
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if company has enough credits
    if (!company.billingData?.credits || company.billingData.credits <= company.billingData?.creditsUsed) {
      return res.status(403).json({ 
        message: 'Company has insufficient credits. Please contact your administrator to purchase more credits.' 
      });
    }

    // Check session limits
    const maxSessions = hr.maxSessions || company.billingData?.totalMaxSessions || 10;
    const sessionsCreated = hr.sessionsCreated || 0;

    if (sessionsCreated >= maxSessions) {
      return res.status(403).json({ 
        message: 'Session limit reached. Please contact your administrator.' 
      });
    }

    // Update session count and credits used
    await Promise.all([
      // Update HR session count
      db.collection('hrs').updateOne(
        { _id: new ObjectId(hrId) },
        { 
          $inc: { sessionsCreated: 1 },
          $set: { lastUpdated: new Date().toISOString() }
        }
      ),
      // Update company credits used
      db.collection('companies').updateOne(
        { _id: new ObjectId(hr.companyId) },
        { 
          $inc: { 'billingData.creditsUsed': 1 },
          $set: { lastUpdated: new Date().toISOString() }
        }
      )
    ]);

    return res.status(200).json({ 
      message: 'Session creation allowed',
      remainingSessions: maxSessions - (sessionsCreated + 1),
      remainingCredits: (company.billingData?.credits || 0) - ((company.billingData?.creditsUsed || 0) + 1)
    });
  } catch (error) {
    console.error('Error checking session limit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 