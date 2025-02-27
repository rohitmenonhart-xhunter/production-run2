import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;
  
  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  const client = await MongoClient.connect(uri);
  
  try {
    const db = client.db('mockello');
    const jobListings = db.collection('job_listings');

    // GET - Fetch specific job
    if (req.method === 'GET') {
      const job = await jobListings.findOne({ _id: new ObjectId(jobId) });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      return res.status(200).json({ job });
    }

    // PUT - Update job
    if (req.method === 'PUT') {
      const updateData = req.body;
      
      // Remove _id from update data if present
      if (updateData._id) {
        delete updateData._id;
      }

      // Add updatedAt timestamp
      updateData.updatedAt = new Date();

      const result = await jobListings.updateOne(
        { _id: new ObjectId(jobId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Fetch and return the updated job
      const updatedJob = await jobListings.findOne({ _id: new ObjectId(jobId) });
      return res.status(200).json({ job: updatedJob });
    }

    // DELETE - Delete job
    if (req.method === 'DELETE') {
      try {
        const result = await jobListings.deleteOne({ _id: new ObjectId(jobId) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Job not found' });
        }

        return res.status(200).json({ message: 'Job deleted successfully' });
      } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({ message: 'Failed to delete job' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
} 