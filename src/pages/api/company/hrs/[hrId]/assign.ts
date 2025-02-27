import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hrId } = req.query;
    const { email, candidateIds } = req.body;

    if (!email || !hrId || !candidateIds || !Array.isArray(candidateIds)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Assigning candidates to HR:', { hrId, candidateCount: candidateIds.length });

    const client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const hrs = db.collection('hrs');
    const companies = db.collection('companies');
    const applications = db.collection('job_applications');

    // Find company
    const company = await companies.findOne({ email });
    console.log('Found company:', company ? 'Yes' : 'No', company?._id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Find HR
    const hr = await hrs.findOne({ 
      _id: new ObjectId(hrId as string),
      companyId: company._id
    });
    console.log('Found HR:', hr ? 'Yes' : 'No');
    
    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    // Update HR's assigned candidates
    const updateHRResult = await hrs.updateOne(
      { _id: new ObjectId(hrId as string) },
      { 
        $set: { 
          assignedCandidates: candidateIds,
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated HR assigned candidates:', updateHRResult.modifiedCount > 0 ? 'Yes' : 'No');

    // Update all applications with HR assignment
    const updateApplicationsResult = await applications.updateMany(
      { 
        $or: [
          { candidateId: { $in: candidateIds.map(id => new ObjectId(id)) } },
          { _id: { $in: candidateIds.map(id => new ObjectId(id)) } }
        ],
        companyId: company._id
      },
      {
        $set: {
          assignedHR: {
            hrId: hr._id,
            hrName: hr.name,
            hrEmail: hr.email,
            assignedAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated applications with HR assignment:', updateApplicationsResult.modifiedCount);

    return res.status(200).json({ 
      message: `Successfully assigned ${candidateIds.length} candidates to HR`,
      updatedApplications: updateApplicationsResult.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk assign HR API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 