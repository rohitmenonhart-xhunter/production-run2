import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, hrId, candidateId } = req.body;

    if (!email || !hrId || !candidateId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db('mockello');

    // Find company
    const company = await db.collection('companies').findOne({ email });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Find HR
    const hr = await db.collection('hrs').findOne({ 
      _id: new ObjectId(hrId),
      companyId: company._id
    });
    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }

    // Find application
    const application = await db.collection('applications').findOne({
      candidateId: candidateId,
      companyEmail: email
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Toggle assignment
    const isAssigned = hr.assignedCandidates?.includes(candidateId);
    const updateOperation = isAssigned
      ? { $pull: { assignedCandidates: candidateId } }
      : { $addToSet: { assignedCandidates: candidateId } };

    // Update HR's assigned candidates
    await db.collection('hrs').updateOne(
      { _id: new ObjectId(hrId) },
      updateOperation
    );

    // Update application with HR assignment
    await db.collection('applications').updateOne(
      { candidateId: candidateId, companyEmail: email },
      {
        $set: {
          assignedHR: isAssigned ? null : {
            hrId: hr._id,
            hrName: hr.name,
            hrEmail: hr.email
          }
        }
      }
    );

    return res.status(200).json({ 
      message: isAssigned ? 'Candidate unassigned successfully' : 'Candidate assigned successfully'
    });
  } catch (error) {
    console.error('Error in assign-hr API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 