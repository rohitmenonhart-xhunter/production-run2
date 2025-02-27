import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { companyEmail } = req.query;
  
  if (!companyEmail) {
    return res.status(400).json({ message: 'Company email is required' });
  }

  console.log('Fetching applications for company:', companyEmail);
  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const jobListings = db.collection('job_listings');
    const applications = db.collection('job_applications');
    const candidates = db.collection('candidates');

    // First, get all jobs for this company
    const companyJobs = await jobListings.find({ companyEmail }).toArray();
    console.log('Found company jobs:', companyJobs.length);
    
    if (companyJobs.length === 0) {
      return res.status(200).json({ applications: [], total: 0 });
    }

    const jobIds = companyJobs.map(job => job._id);
    console.log('Job IDs:', jobIds);

    // First, let's check if we have any applications for these jobs
    const rawApplications = await applications.find({
      jobId: { $in: jobIds }
    }).toArray();
    
    console.log('Found raw applications:', rawApplications.length);
    
    if (rawApplications.length === 0) {
      return res.status(200).json({ applications: [], total: 0 });
    }

    // Get all applications for these jobs with a simpler pipeline first
    const jobApplications = await applications.aggregate([
      {
        $match: {
          jobId: { $in: jobIds }
        }
      },
      {
        $lookup: {
          from: 'job_listings',
          let: { jobId: '$jobId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$jobId' }] }
              }
            }
          ],
          as: 'jobDetails'
        }
      },
      {
        $unwind: {
          path: '$jobDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Add lookup to resumes collection
      {
        $lookup: {
          from: 'resumes',
          let: { mockelloId: '$candidateMockelloId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$mockelloId', '$$mockelloId'] }
              }
            }
          ],
          as: 'resumeDetails'
        }
      },
      {
        $unwind: {
          path: '$resumeDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          jobId: 1,
          candidateMockelloId: 1,
          candidateId: 1,
          status: { $ifNull: ['$status', 'pending'] },
          createdAt: 1,
          updatedAt: 1,
          jobTitle: { $ifNull: ['$jobDetails.title', ''] },
          companyId: 1,
          companyEmail: 1,
          // First try to get from candidateInfo, then fall back to resumeDetails
          candidateName: { 
            $ifNull: [
              '$candidateInfo.fullName',
              { $ifNull: ['$resumeDetails.fullName', 'Unknown Candidate'] }
            ]
          },
          candidateEmail: { 
            $ifNull: [
              '$candidateInfo.email',
              { $ifNull: ['$resumeDetails.email', ''] }
            ]
          },
          candidatePhone: { 
            $ifNull: [
              '$candidateInfo.phone',
              { $ifNull: ['$resumeDetails.phone', ''] }
            ]
          },
          candidateResume: { 
            $ifNull: [
              '$candidateInfo.resumeUrl',
              { $ifNull: ['$resumeDetails.resumeUrl', ''] }
            ]
          },
          candidateSkills: { 
            $ifNull: [
              '$candidateInfo.skills',
              { $ifNull: ['$resumeDetails.skills', []] }
            ]
          },
          candidateExperience: { 
            $cond: {
              if: { $isArray: { $ifNull: ['$candidateInfo.experience', '$resumeDetails.experience'] } },
              then: {
                $reduce: {
                  input: { $ifNull: ['$candidateInfo.experience', '$resumeDetails.experience'] },
                  initialValue: '',
                  in: {
                    $concat: [
                      '$$value',
                      { $cond: [{ $eq: ['$$value', ''] }, '', ', '] },
                      { $ifNull: ['$$this.role', ''] },
                      ' at ',
                      { $ifNull: ['$$this.company', ''] },
                      ' (',
                      { $ifNull: ['$$this.duration', ''] },
                      ')'
                    ]
                  }
                }
              },
              else: ''
            }
          },
          candidateEducation: { 
            $ifNull: [
              '$candidateInfo.education',
              { $ifNull: ['$resumeDetails.education', []] }
            ]
          },
          candidateProjects: { 
            $ifNull: [
              '$candidateInfo.projects',
              { $ifNull: ['$resumeDetails.projects', []] }
            ]
          },
          candidateAchievements: { 
            $ifNull: [
              '$candidateInfo.achievements',
              { $ifNull: ['$resumeDetails.achievements', []] }
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    // Add debug logging
    if (jobApplications.length > 0) {
      console.log('Sample application details:', {
        mockelloId: jobApplications[0].candidateMockelloId,
        name: jobApplications[0].candidateName,
        email: jobApplications[0].candidateEmail
      });
    }

    return res.status(200).json({ 
      applications: jobApplications,
      total: jobApplications.length 
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    await client.close();
  }
} 