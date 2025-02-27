import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mockelloId } = req.query;
  
  if (!mockelloId) {
    return res.status(400).json({ message: 'Mockello ID is required' });
  }

  console.log('Fetching resume for mockelloId:', mockelloId);
  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const resumes = db.collection('resumes');

    const resumeData = await resumes.findOne(
      { mockelloId },
      {
        projection: {
          fullName: 1,
          email: 1,
          phone: 1,
          resumeUrl: 1,
          skills: 1,
          experience: 1,
          achievements: 1
        }
      }
    );
    
    if (!resumeData) {
      console.log('No resume found for mockelloId:', mockelloId);
      // Let's check if the resume exists with a different field name
      const allResumes = await resumes.find({}).toArray();
      console.log('Available resumes:', allResumes.map(r => ({
        mockelloId: r.mockelloId,
        education: !!r.education,
        projects: !!r.projects
      })));
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Ensure we have the required arrays even if they're empty
    const formattedData = {
      ...resumeData,
      skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
      experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
      achievements: Array.isArray(resumeData.achievements) ? resumeData.achievements : []
    };

    console.log('Formatted data:', {
      skills: formattedData.skills.length,
      experience: formattedData.experience.length,
      achievements: formattedData.achievements.length
    });

    return res.status(200).json(formattedData);
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    await client.close();
  }
} 