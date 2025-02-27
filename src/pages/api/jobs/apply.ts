import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const applications = db.collection('job_applications');
    const resumes = db.collection('resumes');
    const jobListings = db.collection('job_listings');
    const companies = db.collection('companies');

    // POST - Submit job application
    if (req.method === 'POST') {
      const { jobId, companyId, mockelloId } = req.body;

      if (!jobId || !companyId || !mockelloId) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Verify candidate exists and mockelloId is valid
      const candidate = await resumes.findOne({ mockelloId });
      if (!candidate) {
        return res.status(404).json({ 
          message: 'Invalid MockelloID. Please make sure you have uploaded your resume first.'
        });
      }

      // Verify job exists and is active
      const job = await jobListings.findOne({ 
        _id: new ObjectId(jobId),
        status: 'active'
      });
      if (!job) {
        return res.status(404).json({ message: 'Job not found or no longer active' });
      }

      // Find company
      const company = await companies.findOne({ email: job.companyEmail });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Check if candidate has already applied
      const existingApplication = await applications.findOne({
        jobId: new ObjectId(jobId),
        candidateMockelloId: mockelloId
      });

      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied for this position' });
      }

      // Create application
      const newApplication = {
        jobId: new ObjectId(jobId),
        jobTitle: job.title,
        candidateMockelloId: mockelloId,
        candidateId: candidate._id,
        companyId: company._id,
        companyEmail: job.companyEmail,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        candidateInfo: {
          fullName: candidate.fullName,
          email: candidate.email,
          resumeUrl: candidate.resumeUrl,
          skills: candidate.skills || [],
          experience: candidate.experience || [],
          education: candidate.education || [],
          projects: candidate.projects || [],
          achievements: candidate.achievements || []
        }
      };

      const result = await applications.insertOne(newApplication);

      // Update company's candidate list
      await companies.updateOne(
        { _id: company._id },
        { 
          $addToSet: { 
            candidates: {
              candidateId: candidate._id,
              mockelloId: candidate.mockelloId,
              applicationId: result.insertedId,
              jobId: new ObjectId(jobId),
              appliedAt: new Date()
            }
          }
        }
      );

      return res.status(201).json({
        message: 'Application submitted successfully',
        applicationId: result.insertedId
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing application:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 