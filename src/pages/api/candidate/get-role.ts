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

  const { mockelloId, hrId } = req.query;
  if (!mockelloId || !hrId) {
    console.log('[get-role] Missing required parameters:', { mockelloId, hrId });
    return res.status(400).json({ message: 'Both Mockello ID and HR ID are required' });
  }

  console.log('[get-role] Starting role fetch for candidate:', { mockelloId, hrId });
  
  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const applications = db.collection('job_applications');
    const hrs = db.collection('hrs');

    // First, verify this candidate is assigned to this HR
    console.log('[get-role] Verifying HR assignment');
    const hr = await hrs.findOne({
      $or: [
        { _id: new ObjectId(hrId as string) },
        { uniqueId: `HR_${hrId}` }
      ],
      assignedCandidates: mockelloId
    });

    console.log('[get-role] HR verification result:', { 
      hrFound: !!hr, 
      hasAssignedCandidate: hr?.assignedCandidates?.includes(mockelloId)
    });

    if (!hr) {
      console.log('[get-role] Candidate not assigned to this HR:', mockelloId);
      return res.status(404).json({
        message: 'Candidate not assigned to this HR',
        role: 'Not specified'
      });
    }

    // Then find the application for this candidate
    console.log('[get-role] Searching for application with mockelloId:', mockelloId);
    const application = await applications.findOne({
      candidateMockelloId: mockelloId
    });

    console.log('[get-role] Application search result:', {
      found: !!application,
      jobTitle: application?.jobTitle,
      status: application?.status
    });

    if (!application) {
      console.log('[get-role] No application found for candidate:', mockelloId);
      return res.status(404).json({ 
        message: 'No application found for this candidate',
        role: 'Not specified'
      });
    }

    // Return the job title from the application
    const response = {
      role: application.jobTitle || 'Not specified',
      status: application.status || 'Pending',
      appliedAt: application.createdAt || new Date().toISOString()
    };

    console.log('[get-role] Returning role info:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('[get-role] Error in handler:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 