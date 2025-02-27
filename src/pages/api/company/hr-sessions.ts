import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

const COST_PER_SESSION = 6; // $6 per session

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Company email is required' });
    }

    console.log('Querying for company email:', email);

    const { db } = await connectToDatabase();

    // First get the company ID using the email
    const company = await db.collection('companies').findOne({ email: email.toString() });
    if (!company) {
      return res.status(200).json({ 
        message: 'Company not found',
        queryEmail: email.toString(),
        hrs: [],
        billing: {
          totalCost: 0,
          totalSessions: 0,
          costPerSession: COST_PER_SESSION
        }
      });
    }

    console.log('Found company:', company._id.toString());
    
    // Get all HRs for this company using companyId
    const hrs = await db.collection('hrs')
      .find({ 
        companyId: new ObjectId(company._id)
      })
      .project({
        _id: 1,
        username: 1,
        email: 1,
        sessionsCreated: 1,
        lastUpdated: 1
      })
      .toArray();

    console.log('Found HRs:', hrs);

    if (!hrs || hrs.length === 0) {
      console.log('No HRs found for company ID:', company._id);
      return res.status(200).json({ 
        message: 'No HRs found for this company',
        queryEmail: email.toString(),
        hrs: [],
        billing: {
          totalCost: 0,
          totalSessions: 0,
          costPerSession: COST_PER_SESSION
        }
      });
    }

    // Format the response with just the necessary data
    const formattedHrs = hrs.map(hr => ({
      _id: hr._id.toString(),
      username: hr.username || 'Unknown',
      email: hr.email,
      sessionsCreated: hr.sessionsCreated || 0,
      maxSessions: 100,
      lastUpdated: hr.lastUpdated || new Date().toISOString(),
      billingAmount: (hr.sessionsCreated || 0) * COST_PER_SESSION
    }));

    // Calculate total billing
    const totalSessions = formattedHrs.reduce((sum, hr) => sum + (hr.sessionsCreated || 0), 0);
    const totalCost = totalSessions * COST_PER_SESSION;

    // Get stored billing data if available
    const storedBillingData = company.billingData || {
      totalSessions: 0,
      totalMaxSessions: 0,
      totalCost: 0,
      costPerSession: COST_PER_SESSION,
      lastUpdated: new Date().toISOString()
    };

    console.log('Formatted HRs:', formattedHrs);
    console.log('Stored billing data:', storedBillingData);

    // Use the higher value between stored and calculated totals
    const finalBilling = {
      totalCost: Math.max(totalCost, storedBillingData.totalCost),
      totalSessions: Math.max(totalSessions, storedBillingData.totalSessions),
      costPerSession: COST_PER_SESSION
    };

    return res.status(200).json({ 
      hrs: formattedHrs,
      billing: finalBilling
    });

  } catch (error: any) {
    console.error('Error fetching HR sessions:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 