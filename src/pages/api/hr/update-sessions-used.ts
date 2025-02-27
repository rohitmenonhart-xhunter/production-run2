import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hrId, sessionsToAdd } = req.body;
    console.log('Received request:', { hrId, sessionsToAdd });

    if (!hrId || typeof sessionsToAdd !== 'number') {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (dbError: any) {
      console.error('MongoDB connection error:', dbError);
      return res.status(500).json({ 
        message: 'Database connection failed',
        error: dbError.message 
      });
    }

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(hrId);
    } catch (idError: any) {
      console.error('Invalid ObjectId:', hrId);
      return res.status(400).json({ 
        message: 'Invalid HR ID format',
        error: idError.message 
      });
    }

    // First check if the HR exists
    const existingHR = await db.collection('hrs').findOne({ _id: objectId });
    console.log('Existing HR:', existingHR);

    if (!existingHR) {
      return res.status(404).json({ message: 'HR not found' });
    }

    // Update the HR document
    const result = await db.collection('hrs').updateOne(
      { _id: objectId },
      { 
        $inc: { sessionsCreated: sessionsToAdd },
        $set: { lastUpdated: new Date() }
      }
    );

    if (!result.acknowledged) {
      throw new Error('Failed to update sessions count');
    }

    // Get the updated HR document
    const updatedHR = await db.collection('hrs').findOne({ _id: objectId });
    console.log('Updated HR:', updatedHR);

    const sessionsCreated = updatedHR?.sessionsCreated || 0;
    const maxSessions = updatedHR?.maxSessions || 100;
    let warningMessage = '';

    if (sessionsCreated >= maxSessions) {
      warningMessage = 'You have reached your maximum session limit.';
    } else if (sessionsCreated >= maxSessions * 0.8) {
      warningMessage = `Warning: You have used ${sessionsCreated} out of ${maxSessions} available sessions.`;
    }

    return res.status(200).json({
      message: 'Sessions count updated successfully',
      sessionsCreated: sessionsCreated,
      maxSessions: maxSessions,
      warningMessage: warningMessage || undefined
    });

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 