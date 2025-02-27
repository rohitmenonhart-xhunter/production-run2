import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/utils/firebase';
import { ref, get } from 'firebase/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Reference to session feedback in Firebase
    const feedbackRef = ref(database, `sessionsfeedback/${sessionId}`);
    const snapshot = await get(feedbackRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const feedback = snapshot.val();
    return res.status(200).json({ feedback });

  } catch (error) {
    console.error('Error fetching session feedback:', error);
    return res.status(500).json({ message: 'Failed to fetch session feedback' });
  }
} 