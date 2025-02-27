import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('NEXT_PUBLIC_OPENAI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeResume(resumeData: any) {
  const prompt = `
    Please provide a comprehensive analysis of this resume in the following format:

    # Professional Summary
    [Provide a detailed 8-10 line summary highlighting:
    - Educational background and major achievements
    - Key technical skills and expertise
    - Notable projects and their impact
    - Professional interests and career goals
    - Unique talents and strengths]

    # Academic Excellence
    [Analyze educational background, including:
    - Academic achievements
    - Relevant coursework
    - Technical skills developed
    - Research or academic projects]

    # Technical Proficiency
    [Detailed analysis of technical skills:
    - Programming languages and proficiency levels
    - Frameworks and tools
    - Areas of expertise
    - Technical achievements]

    # Project Portfolio
    [Analysis of key projects:
    - Technical complexity
    - Problem-solving approach
    - Impact and outcomes
    - Technologies utilized]

    # Achievements & Recognition
    [Highlight notable achievements:
    - Awards and honors
    - Certifications
    - Leadership roles
    - Competition results]

    # Personal Interests & Talents
    [Analyze personal aspects:
    - Technical interests
    - Soft skills
    - Extracurricular activities
    - Unique talents]

    # Job Recommendations
    [List each job title on a new line, focusing on roles that match their technical skills and interests. List 6-9 relevant roles.]

    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}

    Please provide detailed insights in each section. For job recommendations, ONLY include the job titles, one per line.
  `;

  try {
    // Random wait time between 3-9 seconds
    const waitTime = Math.floor(Math.random() * (9000 - 3000 + 1) + 3000);
    await new Promise(resolve => setTimeout(resolve, waitTime));

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "No analysis available";
  } catch (error) {
    console.error("Error analyzing resume with OpenAI:", error);
    throw new Error("Failed to analyze resume");
  }
} 