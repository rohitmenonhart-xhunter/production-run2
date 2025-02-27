import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { generateMockelloId } from '@/utils/generateMockelloId';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyName, email, password, website, companyData } = req.body;

    // Validate required fields
    if (!companyName || !email || !password || !website) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate MockelloID
    const mockelloId = generateMockelloId({
      companyName,
      industry: companyData && 'industry' in companyData ? companyData.industry : '',
      description: companyData && 'description' in companyData ? companyData.description : ''
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to MongoDB
    const client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const companies = db.collection('companies');

    // Check if company already exists
    const existingCompany = await companies.findOne({ email });
    if (existingCompany) {
      await client.close();
      return res.status(400).json({ error: 'Company already exists' });
    }

    // Create company document
    const company = {
      companyName,
      email,
      password: hashedPassword,
      website,
      mockelloId, // Add MockelloID
      companyData, // Store the analyzed company data
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    await companies.insertOne(company);
    await client.close();

    // Return success without password
    const { password: _, ...companyWithoutPassword } = company;
    res.status(201).json(companyWithoutPassword);
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Failed to create company account' });
  }
} 