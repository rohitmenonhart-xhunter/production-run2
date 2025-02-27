import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Company email is required' });
    }

    const { db } = await connectToDatabase();

    // Get company data including billing information
    const company = await db.collection('companies').findOne({ email });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json({ company });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 