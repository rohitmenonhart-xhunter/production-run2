import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const hrs = db.collection('hrs');
    const companies = db.collection('companies');

    // Find HR by username
    const hr = await hrs.findOne({ username });
    if (!hr) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, hr.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get company details
    const company = await companies.findOne({ _id: hr.companyId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if HR has a uniqueId, if not generate one
    let uniqueId = hr.uniqueId;
    if (!uniqueId) {
      uniqueId = `HR_${hr._id.toString()}_${Date.now()}`;
      // Update HR with the new uniqueId
      await hrs.updateOne(
        { _id: hr._id },
        { $set: { uniqueId: uniqueId } }
      );
    }

    // Return HR data with required fields
    return res.status(200).json({
      hr: {
        _id: hr._id.toString(),
        username: hr.username,
        companyName: company.name,
        companyId: company._id.toString(),
        uniqueId: uniqueId // Include the uniqueId in the response
      }
    });
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 