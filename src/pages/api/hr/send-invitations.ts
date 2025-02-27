import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuWTdQuHs_l6rvfzaxvY4y-Uzn0EARRwM",
  authDomain: "athentication-3c73e.firebaseapp.com",
  databaseURL: "https://athentication-3c73e-default-rtdb.firebaseio.com",
  projectId: "athentication-3c73e",
  storageBucket: "athentication-3c73e.firebasestorage.app",
  messagingSenderId: "218346867452",
  appId: "1:218346867452:web:58a57b37f6b6a42ec72579",
  measurementId: "G-3GBM5TSMLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

interface Candidate {
  email: string;
  name: string;
  mockelloId: string;
}

interface RequiredSkills {
  technicalSkills: string[];
  softSkills: string[];
}

interface SessionResult {
  sessionId: string;
  batchId: string;
}

async function createSessionForCandidate(
  candidate: Candidate, 
  hrId: string, 
  hrName: string, 
  hrUniqueId: string,
  requiredSkills: RequiredSkills,
  candidateDetails: any
): Promise<SessionResult> {
  try {
    // Create a new session reference directly under sessions
    const sessionsRef = ref(database, 'sessions');
    const newSessionRef = push(sessionsRef);
    const sessionId = newSessionRef.key;

    if (!sessionId) {
      throw new Error('Failed to generate session ID');
    }

    // Generate roleplay prompt with candidate details and required skills
    const roleplayPrompt = `
Context for AI Interview Agent:

Candidate Information:
- Name: ${candidate.name}
- Mockello ID: ${candidate.mockelloId}
- Applied Role: ${candidateDetails?.appliedRole || 'Not specified'}

Required Technical Skills:
${requiredSkills.technicalSkills.map(skill => `- ${skill}`).join('\n')}

Required Soft Skills:
${requiredSkills.softSkills.map(skill => `- ${skill}`).join('\n')}

Candidate Background:
${candidateDetails ? `
Education:
${(candidateDetails.education || []).map((edu: string) => `- ${edu}`).join('\n')}

Experience:
${(candidateDetails.experience || []).map((exp: string) => `- ${exp}`).join('\n')}

Skills:
${(candidateDetails.skills || []).map((skill: string) => `- ${skill}`).join('\n')}

Projects:
${(candidateDetails.projects || []).map((project: string) => `- ${project}`).join('\n')}

Achievements:
${(candidateDetails.achievements || []).map((achievement: string) => `- ${achievement}`).join('\n')}
` : 'No detailed background information available.'}

Interview Focus:
1. Evaluate candidate's proficiency in the required technical skills
2. Assess candidate's soft skills through behavioral questions
3. Validate candidate's experience and projects
4. Test practical knowledge through scenario-based questions
5. Ensure alignment with role requirements

Please conduct a professional interview focusing on these areas while maintaining a conversational tone.`.trim();

    // Create session data
    const sessionData = {
      sessionId,
      candidateEmail: candidate.email,
      candidateName: candidate.name,
      mockelloId: candidate.mockelloId,
      hrId,
      hrName,
      hrUniqueId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      feedback: null,
      performancePercentage: null,
      interviewDate: null,
      interviewTime: null,
      batchId: `${hrUniqueId}_${Date.now()}`,
      requiredSkills,
      roleplayPrompt,
      candidateDetails: candidateDetails || null
    };

    // Save session data directly under sessions/sessionId
    const specificSessionRef = ref(database, `sessions/${sessionId}`);
    await set(specificSessionRef, sessionData);
    console.log('Created session:', sessionId, 'for candidate:', candidate.email);

    return { sessionId, batchId: sessionData.batchId };
  } catch (error) {
    console.error('Error creating session for candidate:', candidate.email, error);
    throw error;
  }
}

function generateEmailContent(
  candidates: Candidate[], 
  hrName: string, 
  sessionInfo: { [key: string]: { sessionId: string, batchId: string } },
  requiredSkills: RequiredSkills
) {
  const emailSubject = `Interview Invitation from ${hrName}`;
  const emailBody = `
Dear Candidates,

You have been invited to participate in an interview by ${hrName}.

Required Skills:

Technical Skills:
${requiredSkills.technicalSkills.map(skill => `- ${skill}`).join('\n')}

Soft Skills:
${requiredSkills.softSkills.map(skill => `- ${skill}`).join('\n')}

Please use your assigned details to join the interview:

${candidates.map(candidate => `
${candidate.name}
Mockello ID: ${candidate.mockelloId}
Session ID: ${sessionInfo[candidate.email].sessionId}
Interview Link: ${process.env.NEXT_PUBLIC_BASE_URL}/interview/${sessionInfo[candidate.email].sessionId}
`).join('\n')}

Best regards,
Mockello Team
  `.trim();

  return {
    subject: emailSubject,
    body: emailBody,
    to: candidates.map(c => c.email).join(',')
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    const { hrId, hrName, hrUniqueId, candidates, requiredSkills } = req.body;

    if (!hrId || !hrName || !hrUniqueId || !candidates || !requiredSkills) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Connect to MongoDB to check credits
    const { db } = await connectToDatabase();

    // Get HR data to find company
    const hr = await db.collection('hrs').findOne({ 
      _id: new ObjectId(hrId) 
    });

    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    // Get company data to check credits
    const company = await db.collection('companies').findOne({ 
      _id: new ObjectId(hr.companyId) 
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if company has enough credits for all candidates
    const requiredCredits = candidates.length; // 1 credit per candidate
    const availableCredits = (company.billingData?.credits || 0) - (company.billingData?.creditsUsed || 0);

    if (availableCredits < requiredCredits) {
      return res.status(403).json({ 
        message: `Insufficient credits. Need ${requiredCredits} credits but only have ${availableCredits} available.` 
      });
    }

    // Create sessions for all candidates with HR identifier and their details
    const sessionPromises = candidates.map((candidate: Candidate) => {
      // Find candidate details from the assignedCandidates array
      const candidateDetails = req.body.assignedCandidates?.find(
        (c: any) => c.mockelloId === candidate.mockelloId
      );
      
      return createSessionForCandidate(
        candidate, 
        hrId, 
        hrName, 
        hrUniqueId, 
        requiredSkills,
        candidateDetails
      );
    });

    // Wait for all sessions to be created
    const sessionResults = await Promise.all(sessionPromises);

    // Update credits used and session count
    await Promise.all([
      // Update HR session count
      db.collection('hrs').updateOne(
        { _id: new ObjectId(hrId) },
        { 
          $inc: { sessionsCreated: candidates.length },
          $set: { lastUpdated: new Date().toISOString() }
        }
      ),
      // Update company credits used
      db.collection('companies').updateOne(
        { _id: new ObjectId(hr.companyId) },
        { 
          $inc: { 'billingData.creditsUsed': candidates.length },
          $set: { lastUpdated: new Date().toISOString() }
        }
      )
    ]);
    
    // Create a map of email to session info
    const sessionMap = candidates.reduce((acc: { [key: string]: SessionResult }, candidate: Candidate, index: number) => {
      acc[candidate.email] = sessionResults[index];
      return acc;
    }, {} as { [key: string]: SessionResult });

    // Generate email content with session IDs and required skills
    const { subject, body, to } = generateEmailContent(candidates, hrName, sessionMap, requiredSkills);

    // Create mailto URL
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    res.status(200).json({ 
      message: 'Email client ready',
      mailtoUrl,
      batchId: sessionResults[0].batchId,
      recipients: candidates.map((c: Candidate, index: number) => ({ 
        email: c.email, 
        name: c.name,
        sessionId: sessionResults[index].sessionId,
        batchId: sessionResults[index].batchId
      })),
      creditsUsed: candidates.length,
      remainingCredits: availableCredits - candidates.length
    });
  } catch (error) {
    console.error('Error in send-invitations handler:', {
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      message: 'Failed to prepare email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 