import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface RecommendationRequest {
  currentSkills: string[];
  skillType: 'technical' | 'soft';
  role?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getRecommendationsFromOpenAI(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert technical recruiter with deep knowledge of modern technology stacks, frameworks, and industry requirements. 
Your task is to recommend highly relevant skills that complement the given skills.

For technical skills:
- Focus on related technologies in the same ecosystem
- Include both foundational and advanced skills
- Consider modern industry standards and best practices
- Suggest skills that would make a well-rounded technical profile

For soft skills:
- Recommend complementary skills that enhance the given skills
- Focus on skills valued in modern workplaces
- Consider team and project management aspects
- Suggest skills that would make a well-rounded professional profile

Keep recommendations specific, practical, and directly related to the provided skills.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error getting recommendations from OpenAI:', error);
    throw error;
  }
}

async function generatePrompt(request: RecommendationRequest) {
  const { skillType, currentSkills, role } = request;
  const skillTypeStr = skillType === 'technical' ? 'technical skills' : 'soft skills';
  const currentSkillsStr = currentSkills.join(', ');
  const roleContext = role ? ` for a ${role} position` : '';

  if (currentSkills.length === 0) {
    return `Recommend 5 essential ${skillTypeStr} that would be valuable${roleContext}. 
Focus on foundational and widely-applicable skills.
Format your response as a comma-separated list of skills only, without numbering or explanation.`;
  }

  if (skillType === 'technical') {
    return `Given these technical skills${roleContext}: ${currentSkillsStr}

Recommend 5 additional technical skills that would:
1. Complement the existing technical stack
2. Fill any gaps in the technology ecosystem
3. Add valuable related technologies
4. Enhance the overall technical capability
5. Follow modern industry standards

Format your response as a comma-separated list of skills only, without numbering or explanation.
Focus on skills that directly relate to or enhance the existing skills.`;
  } else {
    return `Given these soft skills${roleContext}: ${currentSkillsStr}

Recommend 5 additional soft skills that would:
1. Complement the existing skill set
2. Address modern workplace requirements
3. Enhance professional effectiveness
4. Support career growth
5. Improve team and project collaboration

Format your response as a comma-separated list of skills only, without numbering or explanation.
Focus on skills that naturally pair with the existing ones.`;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { currentSkills, skillType, role } = req.body as RecommendationRequest;

    if (!currentSkills || !Array.isArray(currentSkills)) {
      return res.status(400).json({ message: 'Invalid or missing currentSkills array' });
    }

    if (!skillType || !['technical', 'soft'].includes(skillType)) {
      return res.status(400).json({ message: 'Invalid or missing skillType' });
    }

    const prompt = await generatePrompt({ currentSkills, skillType, role });
    const recommendationsText = await getRecommendationsFromOpenAI(prompt);
    
    // Parse the comma-separated response into an array
    const recommendations = recommendationsText
      ?.split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => 
        skill && 
        !currentSkills.includes(skill) && 
        !currentSkills.some(current => 
          skill.toLowerCase().includes(current.toLowerCase()) || 
          current.toLowerCase().includes(skill.toLowerCase())
        )
      ) || [];

    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Error in get-skill-recommendations:', error);
    return res.status(500).json({ 
      message: 'Failed to get recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
