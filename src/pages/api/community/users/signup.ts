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

    const { email, password, name, type, company, college, graduationYear } = req.body;
    console.log('Attempting signup for:', { email, name, type });

    if (!email || !password || !name || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      name,
      type,
      company: type === 'hr' ? company : undefined,
      college: type === 'student' ? college : undefined,
      graduationYear: type === 'student' ? graduationYear : undefined,
      reputation: 0,
      badges: [],
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      isApproved: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newUser);
    console.log('Created new user with ID:', result.insertedId);

    // Return user data without password
    const { password: _, ...userData } = newUser;
    const userWithId = { ...userData, _id: result.insertedId };
    console.log('Returning user data:', userWithId);
    
    res.status(201).json(userWithId);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
} 