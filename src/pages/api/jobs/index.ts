import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const jobListings = db.collection('job_listings');
    const companies = db.collection('companies');

    // GET - List all jobs
    if (req.method === 'GET') {
      console.log('Fetching all active jobs');
      
      const allJobs = await jobListings
        .find({ 
          status: 'active'
        })
        .sort({ createdAt: -1 })
        .toArray();

      console.log('Found jobs:', allJobs.length);
      
      const jobsWithCompanyDetails = await Promise.all(
        allJobs.map(async (job) => {
          if (job.companyEmail) {
            const company = await companies.findOne({ email: job.companyEmail });
            return {
              ...job,
              companyName: company?.companyName || job.companyName,
              companyId: company?._id || null
            };
          }
          return job;
        })
      );

      return res.status(200).json({ jobs: jobsWithCompanyDetails });
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
        status = 'active',
        campusRecruitment,
        eligibilityCriteria
      } = req.body;

      if (!title || !description || !jobType || !workLocation || !companyEmail) {
        return res.status(400).json({ 
          message: 'Required fields are missing',
          required: ['title', 'description', 'jobType', 'workLocation', 'companyEmail']
        });
      }

      // Find company
      const company = await companies.findOne({ email: companyEmail });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const newJob = {
        title,
        description,
        jobType,
        workLocation,
        workHours: workHours || '',
        salary: salary || { min: 0, max: 0, currency: '₹' },
        experience: experience || { min: 0, max: 0 },
        skills: Array.isArray(skills) ? skills : [],
        benefits: Array.isArray(benefits) ? benefits : [],
        companyEmail,
        companyName: company.companyName,
        status,
        campusRecruitment: {
          driveDate: campusRecruitment?.driveDate || new Date().toISOString(),
          applicationDeadline: campusRecruitment?.applicationDeadline || new Date().toISOString(),
          selectionProcess: Array.isArray(campusRecruitment?.selectionProcess) ? 
            campusRecruitment.selectionProcess : ['Interview'],
          isActive: campusRecruitment?.isActive ?? true
        },
        eligibilityCriteria: {
          cgpa: eligibilityCriteria?.cgpa || 0,
          backlogs: eligibilityCriteria?.backlogs || 0,
          branches: Array.isArray(eligibilityCriteria?.branches) ? 
            eligibilityCriteria.branches : ['All Branches'],
          graduationYear: eligibilityCriteria?.graduationYear || new Date().getFullYear()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await jobListings.insertOne(newJob);

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
  } finally {
    await client.close();
  }
} 