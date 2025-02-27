import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, companyData } = req.body;

    if (!email || !companyData) {
      return res.status(400).json({ error: 'Email and company data are required' });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const companies = db.collection('companies');

    // Update company data
    const result = await companies.updateOne(
      { email },
      { 
        $set: { 
          companyData,
          updatedAt: new Date()
        } 
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json({ message: 'Company information updated successfully' });
  } catch (error) {
    console.error('Error updating company info:', error);
    res.status(500).json({ error: 'Failed to update company information' });
  }
} 