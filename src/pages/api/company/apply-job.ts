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
    const db = client.db('mockello');

    // Get candidate data from resumes collection
    const candidate = await db.collection('resumes').findOne({ mockelloId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Get job and company details
    const job = await db.collection('job_listings').findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get company details
    const company = await db.collection('companies').findOne({ email: job.companyEmail });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Create application
    const application = {
      candidateId: candidate._id,
      mockelloId,
      jobId: new ObjectId(jobId),
      companyId: company._id,
      jobTitle,
      companyName,
      companyEmail: job.companyEmail,
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      resumeUrl: candidate.resumeUrl,
      status: 'pending',
      appliedAt: new Date(),
      skills: candidate.skills || [],
      experience: candidate.experience || [],
      education: candidate.education || [],
      projects: candidate.projects || [],
      achievements: candidate.achievements || [],
      matchScore: 0,
      qualified: false,
      lastUpdated: new Date()
    };

    // Insert application
    await db.collection('applications').insertOne(application);

    return res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error in apply-job API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 