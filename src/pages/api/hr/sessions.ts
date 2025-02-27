import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hrUniqueId } = req.query;

    if (!hrUniqueId || typeof hrUniqueId !== 'string') {
      return res.status(400).json({ message: 'HR unique ID is required' });
    }

    // Get sessions for this HR
    const sessionsRef = ref(database, `sessions/${hrUniqueId}`);
    const snapshot = await get(sessionsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({ 
        message: 'No sessions found',
        batches: []
      });
    }

    // Group sessions by batchId
    const sessions = snapshot.val();
    const batchMap = new Map();

    Object.values(sessions).forEach((session: any) => {
      const { batchId, sessionId, candidateEmail, candidateName } = session;
      
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          batchId,
          timestamp: session.createdAt,
          candidates: []
        });
      }

      batchMap.get(batchId).candidates.push({
        email: candidateEmail,
        name: candidateName,
        sessionId
      });
    });

    // Convert map to array and sort by timestamp (newest first)
    const batches = Array.from(batchMap.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      message: 'Sessions retrieved successfully',
      batches
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 