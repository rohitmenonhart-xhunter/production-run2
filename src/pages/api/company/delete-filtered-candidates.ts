import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, percentage } = req.query;
  
  if (!email || !percentage) {
    return res.status(400).json({ message: 'Company email and percentage are required' });
  }

  let client;
  try {
    client = await MongoClient.connect(uri);
    const db = client.db('mockello');
    const applications = db.collection('job_applications');
    const candidates = db.collection('resumes');

    // Get all applications for this company
    const allApplications = await applications.find({ 
      companyEmail: email 
    }).toArray();

    // Process each application and get match percentages
    const applicationsToDelete = await Promise.all(
      allApplications.map(async (application) => {
        // Try to find the resume using multiple possible ID fields
        const candidateQueries = [
          { mockelloId: application.candidateMockelloId },
          { uniqueId: application.candidateMockelloId },
          { candidateId: application.candidateMockelloId }
        ];

        let candidate = null;
        for (const query of candidateQueries) {
          candidate = await candidates.findOne(query);
          if (candidate) break;
        }

        if (!candidate) return null;

        // Get candidate skills and recommended roles
        const candidateSkills = candidate.skills || candidate.candidateInfo?.skills || [];
        const recommendedRoles = candidate.recommendedRoles || [];

        // Calculate match percentage using the same function from ats.ts
        const matchPercentage = calculateMatchPercentage(application.jobTitle, recommendedRoles);

        // If match percentage is below the threshold, mark for deletion
        if (matchPercentage < Number(percentage)) {
          return application._id;
        }
        return null;
      })
    );

    // Filter out nulls and delete the applications
    const idsToDelete = applicationsToDelete.filter((id): id is NonNullable<typeof id> => id !== null);
    
    if (idsToDelete.length > 0) {
      await applications.deleteMany({
        _id: { $in: idsToDelete }
      });
    }

    return res.status(200).json({ 
      message: `Successfully deleted ${idsToDelete.length} applications below ${percentage}% match`,
      deletedCount: idsToDelete.length
    });

  } catch (error) {
    console.error('Error deleting filtered candidates:', error);
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

function calculateMatchPercentage(appliedRole: string, recommendedRoles: string[]): number {
  if (!recommendedRoles.length) return 0;

  const normalizeString = (str: string) => 
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const stripPrefix = (str: string) => 
    str.replace(/^(senior|junior|lead|principal)\s+/i, '');

  const normalizedAppliedRole = normalizeString(appliedRole);
  const strippedAppliedRole = stripPrefix(normalizedAppliedRole);
  
  const normalizedRecommendedRoles = recommendedRoles.map(role => ({
    full: normalizeString(role),
    stripped: stripPrefix(normalizeString(role))
  }));

  if (normalizedRecommendedRoles.some(role => role.full === normalizedAppliedRole)) {
    return 100;
  }

  if (normalizedRecommendedRoles.some(role => role.stripped === strippedAppliedRole)) {
    return 90;
  }

  const similarities = normalizedRecommendedRoles.map(recommendedRole => {
    const appliedWords = strippedAppliedRole.split(' ');
    const recommendedWords = recommendedRole.stripped.split(' ');
    
    const matchingWords = appliedWords.filter(word => 
      recommendedWords.some(rWord => rWord.includes(word) || word.includes(rWord))
    ).length;
    
    const maxWords = Math.max(appliedWords.length, recommendedWords.length);
    return (matchingWords / maxWords) * 100;
  });

  return Math.round(Math.max(...similarities));
} 