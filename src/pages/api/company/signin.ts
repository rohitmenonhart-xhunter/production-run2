import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

// Get the MongoDB URI
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

  let client: MongoClient | null = null;

  try {
    const { email, password } = req.body;
    console.log('Attempting sign in for email:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Connect to MongoDB with minimal options
    console.log('Connecting to MongoDB...');
    try {
      client = await MongoClient.connect(uri, {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        maxPoolSize: 1
      });
      console.log('Connected to MongoDB successfully');
    } catch (connError) {
      console.error('MongoDB connection error:', connError);
      throw new Error('Database connection failed: ' + (connError instanceof Error ? connError.message : 'Unknown error'));
    }
    
    const db = client.db('mockello');
    const companies = db.collection('companies');

    // Find company by email
    console.log('Looking up company with email:', email);
    let company;
    try {
      company = await companies.findOne({ email });
      console.log('Company lookup result:', company ? 'Found' : 'Not found');
    } catch (lookupError) {
      console.error('Company lookup error:', lookupError);
      throw new Error('Database query failed');
    }
    
    if (!company) {
      console.log('No company found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Found company:', company._id.toString());

    // Verify password
    console.log('Verifying password...');
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, company.password);
      console.log('Password verification result:', isPasswordValid ? 'Valid' : 'Invalid');
    } catch (bcryptError) {
      console.error('Password verification error:', bcryptError);
      throw new Error('Password verification failed');
    }
    
    if (!isPasswordValid) {
      console.log('Invalid password for company:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Password verified successfully');

    // Return company data without password
    const { password: _, ...companyWithoutPassword } = company;
    console.log('Sign in successful for company:', email);
    return res.status(200).json({ company: companyWithoutPassword });

  } catch (error) {
    console.error('Error during signin:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Send a more specific error message based on the error type
    const errorMessage = error instanceof Error 
      ? error.message
      : 'An unexpected error occurred during sign in';
    return res.status(500).json({ error: errorMessage });
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close();
        console.log('MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
} 