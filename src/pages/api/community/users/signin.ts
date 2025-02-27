import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'mockello';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'Missing MongoDB URI' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    const collection = db.collection('community_users');

    const { email, password } = req.body;
    console.log('Attempting signin for email:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await collection.findOne({ email });
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Log user data (excluding password)
    const { password: hashedPassword, ...logUserData } = user;
    console.log('User data:', logUserData);

    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    if (!isValidPassword) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active timestamp
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastActiveAt: new Date() } }
    );

    // Return user data without sensitive information
    const { password: _, ...userData } = user;
    console.log('Login successful, returning user data');
    res.status(200).json(userData);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
} 