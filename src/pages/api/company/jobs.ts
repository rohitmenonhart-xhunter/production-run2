import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    // GET - Fetch company jobs
    if (req.method === 'GET') {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: 'Company email is required' });
      }

      const jobs = await db.collection('job_listings')
        .find({ 
          companyEmail: email,
          status: 'active'
        })
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json({ jobs });
    }

    // POST - Create new job
    if (req.method === 'POST') {
      const { 
        title, 
        description, 
        jobType, 
        workLocation, 
        workHours, 
        salary, 
        experience,
        skills,
        benefits,
        companyEmail,
        status
      } = req.body;

      if (!title || !description || !jobType || !workLocation || !companyEmail) {
        return res.status(400).json({ message: 'Required fields are missing' });
      }

      // Find company to get name
      const company = await db.collection('companies').findOne({ email: companyEmail });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const newJob = {
        title,
        description,
        jobType,
        workLocation,
        workHours,
        salary,
        experience,
        skills,
        benefits,
        companyEmail,
        companyName: company.name,
        status: status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('job_listings').insertOne(newJob);

      return res.status(201).json({
        message: 'Job posted successfully',
        job: {
          ...newJob,
          _id: result.insertedId
        }
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing jobs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 