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

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Company email is required' });
  }

  console.log('Fetching candidates for company email:', email);

  const client = await MongoClient.connect(uri);
  const db = client.db('mockello');
  const companies = db.collection('companies');
  const applications = db.collection('job_applications');
  const resumes = db.collection('resumes');

  try {
    // Find company
    const company = await companies.findOne({ email });
    console.log('Found company:', company ? 'Yes' : 'No', company?._id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all applications for company's jobs
    const companyApplications = await applications
      .find({
        $or: [
          { companyId: company._id },  // Match ObjectId
          { companyId: company._id.toString() },  // Match string
          { companyEmail: email }  // Additional check using company email
        ]
      })
      .toArray();
    
    console.log('Found applications:', companyApplications.length);
    
    if (companyApplications.length === 0) {
      console.log('No applications found for company');
      return res.status(200).json({ candidates: [] });
    }

    // Log some application details for debugging
    console.log('Sample application:', {
      companyId: companyApplications[0].companyId,
      companyEmail: companyApplications[0].companyEmail,
      candidateMockelloId: companyApplications[0].candidateMockelloId,
      jobTitle: companyApplications[0].jobTitle
    });

    // Get candidate details from resumes collection
    const candidates = await Promise.all(
      companyApplications.map(async (application) => {
        console.log('Processing application for mockelloId:', application.candidateMockelloId);
        
        const resume = await resumes.findOne({ 
          $or: [
            { mockelloId: application.candidateMockelloId },
            { _id: application.candidateId }
          ]
        });
        console.log('Found resume:', resume ? 'Yes' : 'No');
        
        if (!resume) {
          console.log('No resume found for mockelloId:', application.candidateMockelloId);
          return null;
        }

        return {
          _id: resume._id,
          mockelloId: resume.mockelloId,
          fullName: resume.fullName || application.candidateInfo?.fullName,
          email: resume.email || application.candidateInfo?.email,
          appliedRole: application.jobTitle,
          status: application.status,
          appliedAt: application.createdAt,
        };
      })
    );

    // Filter out null values and return unique candidates
    const uniqueCandidates = candidates
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
      .reduce((acc, current) => {
        const exists = acc.find(item => item.mockelloId === current.mockelloId);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, [] as NonNullable<typeof candidates[number]>[]);

    console.log('Final unique candidates count:', uniqueCandidates.length);

    return res.status(200).json({ candidates: uniqueCandidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 