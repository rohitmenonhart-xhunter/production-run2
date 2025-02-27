import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an experienced HR professional and interview trainer at Mockello, a career guidance platform. 
Your role is to provide helpful, professional advice about job interviews, career development, and workplace situations. 
Use your expertise to give detailed, practical answers that help users improve their interview skills and career prospects.
Always maintain a supportive and encouraging tone while being direct and honest in your feedback.
Base your responses on best practices in HR and career development.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error in AI response:', error);
    return res.status(500).json({ error: 'Failed to get AI response' });
  }
} 