import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

interface RoleAnalysis {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  justification: string;
}

function analyzeRoleMatch(
  appliedRole: string,
  recommendedRoles: string[],
  candidateSkills: string[]
): RoleAnalysis {
  const normalizedSkills = candidateSkills.map(s => s.toLowerCase());
  
  // Get required skills for the applied role
  const roleRequirements = {
    'Software Engineer': ['javascript', 'python', 'java', 'data structures', 'algorithms', 'problem solving', 'git', 'software design'],
    'Data Scientist': ['python', 'machine learning', 'statistics', 'sql', 'data analysis', 'r', 'deep learning', 'data visualization', 'numpy', 'pandas'],
    'Frontend Developer': ['html', 'css', 'javascript', 'react', 'responsive design', 'typescript', 'vue.js', 'angular', 'web accessibility', 'sass'],
    'Backend Developer': ['node.js', 'python', 'java', 'databases', 'api design', 'spring', 'django', 'express.js', 'microservices', 'redis'],
    'Full Stack Developer': ['javascript', 'html', 'css', 'node.js', 'databases', 'react', 'api integration', 'git', 'aws', 'docker'],
    'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'ci/cd', 'linux', 'terraform', 'ansible', 'jenkins', 'monitoring', 'security'],
    'UI/UX Designer': ['ui design', 'ux research', 'figma', 'wireframing', 'prototyping', 'adobe xd', 'sketch', 'user testing', 'interaction design'],
    'Product Manager': ['product strategy', 'agile', 'user research', 'roadmapping', 'stakeholder management', 'analytics', 'market research'],
    'Mobile Developer': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'mobile ui design', 'app performance'],
    'Cloud Architect': ['aws', 'azure', 'gcp', 'cloud security', 'microservices', 'serverless', 'networking', 'scalability'],
    'Data Engineer': ['sql', 'etl', 'data warehousing', 'python', 'spark', 'hadoop', 'airflow', 'data modeling'],
    'Security Engineer': ['cybersecurity', 'network security', 'penetration testing', 'security tools', 'cryptography', 'risk assessment'],
    'QA Engineer': ['test automation', 'selenium', 'manual testing', 'test planning', 'api testing', 'performance testing', 'jira'],
    'Machine Learning Engineer': ['python', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'model deployment'],
    'Systems Architect': ['system design', 'scalability', 'distributed systems', 'performance optimization', 'technical leadership'],
    'Blockchain Developer': ['solidity', 'web3', 'smart contracts', 'ethereum', 'blockchain protocols', 'cryptography'],
    'AR/VR Developer': ['unity', 'unreal engine', '3d modeling', 'ar frameworks', 'vr development', 'computer graphics'],
    'Technical Writer': ['documentation', 'api documentation', 'technical communication', 'markdown', 'content strategy'],
    'Database Administrator': ['sql', 'database optimization', 'backup and recovery', 'mongodb', 'postgresql', 'oracle'],
    'Network Engineer': ['networking protocols', 'cisco', 'network security', 'vpn', 'routing', 'switching'],
    'Business Analyst': ['requirements gathering', 'data analysis', 'sql', 'business process', 'stakeholder management'],
    'Embedded Systems Engineer': ['c', 'c++', 'microcontrollers', 'rtos', 'embedded linux', 'hardware interfaces'],
    'Game Developer': ['unity', 'unreal engine', 'c++', 'game design', '3d graphics', 'physics engines'],
    'AI Engineer': ['machine learning', 'neural networks', 'nlp', 'computer vision', 'ai frameworks', 'algorithm design']
  };

  const normalizedRole = appliedRole.toLowerCase();
  const requiredSkills = roleRequirements[appliedRole as keyof typeof roleRequirements] || [];
  
  // Find matching and missing skills
  const matchingSkills = requiredSkills.filter(skill => 
    normalizedSkills.some(candidateSkill => candidateSkill.includes(skill))
  );
  const missingSkills = requiredSkills.filter(skill => 
    !normalizedSkills.some(candidateSkill => candidateSkill.includes(skill))
  );

  // Calculate match percentage
  const matchPercentage = calculateMatchPercentage(appliedRole, recommendedRoles);

  // Generate justification based on match percentage tiers
  let justification = '';
  if (matchPercentage >= 70) {
    justification = `Strong match for ${appliedRole} role (${matchPercentage}% match). `;
    if (matchingSkills.length > 0) {
      justification += `Has relevant skills: ${matchingSkills.join(', ')}. `;
    }
  } else if (matchPercentage >= 50) {
    justification = `Medium match for ${appliedRole} role (${matchPercentage}% match). `;
    if (matchingSkills.length > 0) {
      justification += `Has some relevant skills: ${matchingSkills.join(', ')}. `;
    }
    if (missingSkills.length > 0) {
      justification += `Could improve in: ${missingSkills.join(', ')}. `;
    }
  } else if (matchPercentage > 0) {
    justification = `Low match for ${appliedRole} role (${matchPercentage}% match). `;
    if (missingSkills.length > 0) {
      justification += `Missing key skills: ${missingSkills.join(', ')}. `;
    }
    if (recommendedRoles.length > 0) {
      justification += `Better suited for: ${recommendedRoles.join(', ')}. `;
    }
  } else {
    justification = `Not recommended for ${appliedRole} role (0% match). `;
    if (missingSkills.length > 0) {
      justification += `Missing critical skills: ${missingSkills.join(', ')}. `;
    }
    if (recommendedRoles.length > 0) {
      justification += `Consider these roles instead: ${recommendedRoles.join(', ')}. `;
    }
  }

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    justification
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Company email is required' });
  }

  console.log('[ats] Starting analysis for company:', email);
  
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

    console.log('[ats] Found applications:', allApplications.length);

    // Process each application and get candidate recommendations
    const processedCandidates = await Promise.all(
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

        if (!candidate) {
          console.log('[ats] No candidate found for:', application.candidateMockelloId);
          return null;
        }

        console.log('[ats] Found candidate:', {
          id: candidate.mockelloId || candidate.uniqueId || candidate._id,
          name: candidate.fullName || candidate.candidateInfo?.fullName,
          hasRecommendedRoles: !!candidate.recommendedRoles
        });

        // Get candidate skills
        const candidateSkills = candidate.skills || 
          candidate.candidateInfo?.skills || 
          [];

        // Get recommended roles
        const recommendedRoles = candidate.recommendedRoles || 
          inferRolesFromSkills(candidateSkills);

        // Analyze role match
        const analysis = analyzeRoleMatch(
          application.jobTitle,
          recommendedRoles,
          candidateSkills
        );

        return {
          candidateId: candidate.mockelloId || candidate.uniqueId || candidate._id,
          name: candidate.fullName || candidate.candidateInfo?.fullName || 'Unknown',
          appliedRole: application.jobTitle,
          recommendedRoles: recommendedRoles,
          matchPercentage: analysis.matchPercentage,
          matchingSkills: analysis.matchingSkills,
          missingSkills: analysis.missingSkills,
          justification: analysis.justification
        };
      })
    );

    // Filter candidates
    const validCandidates = processedCandidates.filter((c): c is NonNullable<typeof c> => c !== null);
    const allowed = validCandidates.filter(c => c.matchPercentage >= 70);
    const mediumMatch = validCandidates.filter(c => c.matchPercentage >= 50 && c.matchPercentage < 70);
    const notAllowed = validCandidates.filter(c => c.matchPercentage < 50);

    console.log('[ats] Analysis complete:', {
      total: validCandidates.length,
      allowed: allowed.length,
      mediumMatch: mediumMatch.length,
      notAllowed: notAllowed.length
    });

    return res.status(200).json({ 
      allowed,
      mediumMatch,
      notAllowed
    });

  } catch (error) {
    console.error('[ats] Error in handler:', error);
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

function inferRolesFromSkills(skills: string[]): string[] {
  const roleMapping: { [key: string]: string[] } = {
    'Software Engineer': ['javascript', 'python', 'java', 'react', 'node', 'typescript', 'programming'],
    'Data Scientist': ['python', 'machine learning', 'data analysis', 'statistics', 'sql'],
    'Frontend Developer': ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'frontend', 'front-end', 'front end', 'senior frontend', 'senior front-end'],
    'Backend Developer': ['node', 'python', 'java', 'php', 'sql', 'mongodb', 'backend', 'back-end', 'back end'],
    'Full Stack Developer': ['javascript', 'python', 'react', 'node', 'mongodb', 'full stack', 'fullstack', 'full-stack'],
    'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'devops'],
    'UI/UX Designer': ['ui', 'ux', 'design', 'figma', 'adobe', 'user interface', 'user experience'],
    'Product Manager': ['product', 'management', 'agile', 'scrum', 'leadership']
  };

  const normalizedSkills = skills.map(s => s.toLowerCase());
  const matchedRoles = new Set<string>();

  for (const [role, keywords] of Object.entries(roleMapping)) {
    if (keywords.some(keyword => normalizedSkills.some(skill => skill.includes(keyword)))) {
      matchedRoles.add(role);
    }
  }

  return Array.from(matchedRoles);
}

function calculateMatchPercentage(appliedRole: string, recommendedRoles: string[]): number {
  if (!recommendedRoles.length) return 0;

  // Normalize strings for comparison
  const normalizeString = (str: string) => 
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  // Remove common prefixes for comparison
  const stripPrefix = (str: string) => 
    str.replace(/^(senior|junior|lead|principal)\s+/i, '');

  const normalizedAppliedRole = normalizeString(appliedRole);
  const strippedAppliedRole = stripPrefix(normalizedAppliedRole);
  
  const normalizedRecommendedRoles = recommendedRoles.map(role => ({
    full: normalizeString(role),
    stripped: stripPrefix(normalizeString(role))
  }));

  // Check for exact matches first (including with prefix)
  if (normalizedRecommendedRoles.some(role => role.full === normalizedAppliedRole)) {
    return 100;
  }

  // Check for matches without prefix
  if (normalizedRecommendedRoles.some(role => role.stripped === strippedAppliedRole)) {
    return 90; // High match for same role with different seniority
  }

  // Calculate similarity with each recommended role
  const similarities = normalizedRecommendedRoles.map(recommendedRole => {
    // Split into words for better matching
    const appliedWords = strippedAppliedRole.split(' ');
    const recommendedWords = recommendedRole.stripped.split(' ');
    
    // Count matching words
    const matchingWords = appliedWords.filter(word => 
      recommendedWords.some(rWord => rWord.includes(word) || word.includes(rWord))
    ).length;
    
    // Calculate percentage based on matching words
    const maxWords = Math.max(appliedWords.length, recommendedWords.length);
    return (matchingWords / maxWords) * 100;
  });

  // Return the highest similarity percentage
  return Math.round(Math.max(...similarities));
} 