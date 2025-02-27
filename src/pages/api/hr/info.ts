import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hrId } = req.query;

    if (!hrId || typeof hrId !== 'string') {
      return res.status(400).json({ message: 'HR ID is required' });
    }

    const { db } = await connectToDatabase();

    // Get HR data
    const hr = await db.collection('hrs').findOne({ _id: new ObjectId(hrId) });

    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    console.log('Found HR:', { 
      _id: hr._id, 
      companyId: hr.companyId,
      company: hr.company 
    });

    if (!hr.companyId) {
      console.error('HR document missing companyId:', hr);
      return res.status(404).json({ message: 'Company ID not found in HR document' });
    }

    // Get company data using the companyId from HR document
    const company = await db.collection('companies').findOne({ 
      _id: new ObjectId(hr.companyId) 
    });

    if (!company) {
      console.error('Company not found for ID:', hr.companyId);
      return res.status(404).json({ message: 'Company not found' });
    }

    console.log('Found Company:', {
      _id: company._id,
      name: company.name,
      billingData: company.billingData
    });

    // Return HR data with company billing information
    const billingData = company.billingData || {};
    
    return res.status(200).json({
      hr,
      companyBilling: {
        credits: billingData.credits || 0,
        creditsUsed: billingData.creditsUsed || 0,
        totalSessions: billingData.totalSessions || 0,
        totalMaxSessions: billingData.totalMaxSessions || 0
      }
    });
  } catch (error) {
    console.error('Error fetching HR info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 