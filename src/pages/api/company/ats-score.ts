import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Job {
  _id: ObjectId;
  skills: string[];
  experience: {
    min: number;
    max: number | null;
  };
}

interface Experience {
  years: number;
  title: string;
  company: string;
}

interface Education {
  degree: string;
  school: string;
  year: number;
}

interface Application {
  _id: ObjectId;
  skills: string[];
  experience: Experience[];
  education: Education[];
  resumeUrl?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get job details
    const job = await db.collection('jobs').findOne<Job>({ _id: new ObjectId(jobId) });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get all applications for this job
    const applications = await db.collection('applications')
      .find<Application>({ jobId: new ObjectId(jobId) })
      .toArray();

    // Calculate match score for each application
    const scoredApplications = applications.map(application => {
      let score = 0;
      const maxScore = 100;

      // Skills match (40% weight)
      const requiredSkills = job.skills.map((s: string) => s.toLowerCase());
      const candidateSkills = application.skills.map((s: string) => s.toLowerCase());
      const skillMatches = candidateSkills.filter((skill: string) => requiredSkills.includes(skill));
      const skillScore = (skillMatches.length / requiredSkills.length) * 40;
      score += skillScore;

      // Experience match (30% weight)
      const requiredYears = job.experience.min;
      const candidateYears = application.experience.reduce((total: number, exp: Experience) => total + exp.years, 0);
      const experienceScore = Math.min(candidateYears / requiredYears, 1) * 30;
      score += experienceScore;

      // Education match (20% weight)
      const educationScore = application.education.some((edu: Education) => 
        edu.degree.toLowerCase().includes('bachelor') || 
        edu.degree.toLowerCase().includes('master') ||
        edu.degree.toLowerCase().includes('phd')
      ) ? 20 : 10;
      score += educationScore;

      // Resume quality (10% weight)
      // This could be based on resume parsing quality or other metrics
      const resumeScore = application.resumeUrl ? 10 : 0;
      score += resumeScore;

      return {
        ...application,
        matchScore: Math.round(score),
        qualified: score >= 70 // Consider candidates with 70% or higher match as qualified
      };
    });

    // Update applications with scores
    await Promise.all(scoredApplications.map(app => 
      db.collection('applications').updateOne(
        { _id: app._id },
        { $set: { matchScore: app.matchScore, qualified: app.qualified } }
      )
    ));

    return res.status(200).json({ 
      message: 'ATS scoring completed',
      applications: scoredApplications
    });
  } catch (error) {
    console.error('Error in ATS scoring:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 