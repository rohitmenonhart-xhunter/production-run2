import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

interface Resume {
  _id: ObjectId;
  mockelloId?: string;
  fullName?: string;
  email?: string;
  resumeUrl?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  candidateInfo?: {
    fullName?: string;
    email?: string;
    resumeUrl?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
}

interface Candidate {
  _id: ObjectId;
  mockelloId: string;
  fullName: string;
  email: string;
  assignedAt: string;
  resumeUrl: string;
  skills: string[];
  experience: string[];
  education: string[];
}

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { hrId } = req.query;
  if (!hrId) {
    return res.status(400).json({ message: 'HR ID is required' });
  }

  console.log('[assigned-candidates] Starting fetch for HR:', hrId);
  
  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const hrs = db.collection('hrs');
    const resumes = db.collection<Resume>('resumes');

    // Find HR and their assigned candidates
    console.log('[assigned-candidates] Looking for HR with ID:', hrId);
    const hr = await hrs.findOne({ 
      $or: [
        { _id: new ObjectId(hrId as string) },
        { uniqueId: `HR_${hrId}` }
      ]
    });
    
    console.log('[assigned-candidates] HR found:', hr ? 'Yes' : 'No');
    
    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    const assignedCandidates = hr.assignedCandidates || [];
    console.log('[assigned-candidates] Found assigned candidates:', assignedCandidates.length);

    if (assignedCandidates.length === 0) {
      return res.status(200).json({ candidates: [] });
    }

    const candidates = await Promise.all(
      assignedCandidates.map(async (candidateId: string) => {
        console.log(`[assigned-candidates] Processing candidate: ${candidateId}`);
        try {
          // Try to find the resume
          const resumeQueries = [
            { mockelloId: candidateId },
            { uniqueId: candidateId },
            { candidateId: candidateId }
          ] as Array<{ [key: string]: any }>;

          try {
            resumeQueries.unshift({ _id: new ObjectId(candidateId) });
          } catch (e) {
            console.log(`[assigned-candidates] CandidateId ${candidateId} is not a valid ObjectId`);
          }

          let resume = null;
          for (const query of resumeQueries) {
            const result = await resumes.findOne(query);
            if (result) {
              resume = result;
              break;
            }
          }
          console.log(`[assigned-candidates] Resume found for ${candidateId}:`, resume ? 'Yes' : 'No');

          if (!resume) {
            console.log(`[assigned-candidates] No resume found, returning basic info for ${candidateId}`);
            return {
              _id: new ObjectId(),
              mockelloId: candidateId,
              fullName: 'rohit',
              email: '',
              assignedAt: new Date().toISOString(),
              resumeUrl: '',
              skills: [],
              experience: [],
              education: []
            } as Candidate;
          }

          // Return candidate with resume info
          const candidate = {
            _id: resume._id,
            mockelloId: resume.mockelloId || candidateId,
            fullName: resume.fullName || 
                     resume.candidateInfo?.fullName || 
                     'rohit',
            email: resume.email || resume.candidateInfo?.email || '',
            assignedAt: new Date().toISOString(),
            resumeUrl: resume.resumeUrl || '',
            skills: resume.skills || [],
            experience: resume.experience || [],
            education: resume.education || []
          } as Candidate;

          console.log(`[assigned-candidates] Final candidate data for ${candidateId}:`, candidate);
          return candidate;
        } catch (error) {
          console.error(`[assigned-candidates] Error processing candidate ${candidateId}:`, error);
          return null;
        }
      })
    );

    const validCandidates = candidates.filter((c): c is Candidate => c !== null);
    console.log('[assigned-candidates] Final valid candidates count:', validCandidates.length);

    return res.status(200).json({ candidates: validCandidates });
  } catch (error) {
    console.error('[assigned-candidates] Error in main handler:', error);
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