import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mockelloId, jobId, jobTitle, companyName } = req.body;

    if (!mockelloId || !jobId || !jobTitle || !companyName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get candidate data
    const candidate = await db.collection('candidates').findOne({ mockelloId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create application
    const application = {
      candidateId: candidate._id,
      mockelloId,
      jobId: new ObjectId(jobId),
      jobTitle,
      companyName,
      fullName: candidate.fullName,
      email: candidate.email,
      resumeUrl: candidate.resumeUrl,
      status: 'pending',
      appliedAt: new Date(),
      skills: candidate.skills || [],
      experience: candidate.experience || [],
      education: candidate.education || [],
      matchScore: 0, // Will be calculated by ATS
    };

    // Insert application
    await db.collection('applications').insertOne(application);

    return res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error in apply-job API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 