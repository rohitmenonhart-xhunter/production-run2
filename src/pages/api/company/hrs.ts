import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const hrs = db.collection('hrs');
    const companies = db.collection('companies');

    // GET - List HRs for a company
    if (req.method === 'GET') {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ message: 'Company email is required' });
      }

      // Find company
      const company = await companies.findOne({ email });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Get all HRs for this company
      const companyHRs = await hrs.find({ companyId: company._id }).toArray();
      
      // Remove password from response
      const hrsWithoutPassword = companyHRs.map(hr => {
        const { password, ...hrWithoutPassword } = hr;
        return hrWithoutPassword;
      });

      return res.status(200).json({ hrs: hrsWithoutPassword });
    }

    // POST - Create new HR
    if (req.method === 'POST') {
      const { name, email, username, password, companyEmail } = req.body;

      if (!name || !email || !username || !password || !companyEmail) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Find company
      const company = await companies.findOne({ email: companyEmail });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Check if username or email already exists
      const existingHR = await hrs.findOne({ 
        $or: [
          { username },
          { email }
        ]
      });
      
      if (existingHR) {
        return res.status(400).json({ 
          message: existingHR.username === username 
            ? 'Username already exists' 
            : 'Email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new HR
      const newHR = {
        name,
        email,
        username,
        password: hashedPassword,
        companyId: company._id,
        assignedCandidates: [],
        createdAt: new Date(),
      };

      const result = await hrs.insertOne(newHR);

      // Return HR data without password
      const { password: _, ...hrWithoutPassword } = newHR;
      return res.status(201).json({
        hr: {
          ...hrWithoutPassword,
          _id: result.insertedId,
        }
      });
    }

    // DELETE - Remove HR
    if (req.method === 'DELETE') {
      const hrId = req.query.id;
      
      if (!hrId) {
        return res.status(400).json({ message: 'HR ID is required' });
      }

      const result = await hrs.deleteOne({ _id: new ObjectId(hrId as string) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'HR not found' });
      }

      return res.status(200).json({ message: 'HR deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing HRs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 