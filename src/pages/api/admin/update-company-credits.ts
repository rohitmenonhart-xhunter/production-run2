import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { companyId, credits } = req.body;

    if (!companyId || typeof credits !== 'number') {
      return res.status(400).json({ message: 'Company ID and credits are required' });
    }

    const { db } = await connectToDatabase();

    // Get company data
    const company = await db.collection('companies').findOne({ 
      _id: new ObjectId(companyId) 
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update company's credits
    await db.collection('companies').updateOne(
      { _id: new ObjectId(companyId) },
      {
        $set: {
          'billingData.credits': credits,
          lastUpdated: new Date().toISOString()
        }
      }
    );

    // Get updated company data
    const updatedCompany = await db.collection('companies').findOne({ 
      _id: new ObjectId(companyId) 
    });

    return res.status(200).json({ 
      message: 'Company credits updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Error updating company credits:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 