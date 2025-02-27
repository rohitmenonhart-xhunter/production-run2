import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/utils/firebase';
import { ref, get } from 'firebase/database';

interface Session {
  id?: string;
  sessionId: string;
  hrUniqueId: string;
  hrName?: string;
  studentEmails?: string[];
  candidateName?: string;
  candidateEmail?: string;
  candidateDetails?: {
    name: string;
    email: string;
    registerNumber?: string;
    [key: string]: any;
  };
  feedback?: any;
  createdAt: string;
  [key: string]: any;
}

interface SessionFeedback {
  feedback: string;
  interviewDate: string;
  interviewTime: string;
  name: string;
  performancePercentage: number;
  registerNumber: string;
  sessionId: string;
  stars: number;
  timestamp: string;
  totalWords: number;
  transcriptionCount: number;
  email?: string;
  hrUniqueId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hrId } = req.query;

    if (!hrId) {
      return res.status(400).json({ message: 'HR unique ID is required' });
    }

    // First, get all sessions from the sessions path
    const sessionsRef = ref(database, 'sessions');
    const sessionsSnapshot = await get(sessionsRef);

    if (!sessionsSnapshot.exists()) {
      return res.status(200).json({ pendingCount: 0, sessions: [] });
    }

    const hrSessions: { id: string; data: Session }[] = [];
    
    // Filter sessions created by this HR and store original session data
    sessionsSnapshot.forEach((childSnapshot) => {
      const session = childSnapshot.val() as Session;
      if (session.hrUniqueId === hrId) {
        hrSessions.push({
          id: childSnapshot.key!,
          data: session
        });
      }
    });

    console.log(`Found ${hrSessions.length} sessions for HR ${hrId}`);

    // Now fetch feedback and combine with original session data
    const feedbackPromises = hrSessions.map(async (session) => {
      const feedbackRef = ref(database, `sessionsfeedback/${session.id}`);
      const feedbackSnapshot = await get(feedbackRef);
      
      let feedbackData = null;
      if (feedbackSnapshot.exists()) {
        feedbackData = feedbackSnapshot.val();
        
        // Get candidate details from original session data
        const candidateDetails = {
          name: session.data.candidateName || 
                (session.data.candidateDetails?.name) || 
                (session.data.studentEmails && session.data.studentEmails[0]?.split('@')[0]) || 
                'Guest User',
          email: session.data.candidateEmail || 
                 session.data.candidateDetails?.email || 
                 (session.data.studentEmails && session.data.studentEmails[0]) || '',
          registerNumber: session.data.candidateDetails?.registerNumber || feedbackData.registerNumber || 'GUEST'
        };

        // Update feedback data with original session's candidate details
        feedbackData = {
          ...feedbackData,
          name: candidateDetails.name,
          email: candidateDetails.email,
          registerNumber: candidateDetails.registerNumber
        };
      }

      return {
        ...session.data,
        id: session.id,
        feedback: feedbackData,
        candidateDetails: session.data.candidateDetails || null
      };
    });

    const sessionsWithFeedback = await Promise.all(feedbackPromises);
    
    // Count sessions without feedback as pending
    const pendingCount = sessionsWithFeedback.filter(session => !session.feedback).length;

    console.log(`Found ${sessionsWithFeedback.length} total sessions, ${pendingCount} pending`);

    return res.status(200).json({
      pendingCount,
      sessions: sessionsWithFeedback.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('Error fetching pending interviews:', error);
    return res.status(500).json({ message: 'Failed to fetch pending interviews' });
  }
} 