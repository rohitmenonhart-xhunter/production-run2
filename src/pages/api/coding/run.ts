import { NextApiRequest, NextApiResponse } from 'next';

const CEREBRIUM_API_KEY = process.env.CEREBRIUM_API_KEY;
const CEREBRIUM_ENDPOINT = process.env.CEREBRIUM_ENDPOINT;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    const response = await fetch(CEREBRIUM_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CEREBRIUM_API_KEY}`,
      },
      body: JSON.stringify({ code, language, input }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to execute code');
    }

    return res.status(200).json({
      output: data.error ? `Error: ${data.error}` : data.output,
    });
  } catch (error: any) {
    console.error('Error executing code:', error);
    return res.status(500).json({
      error: 'Code execution failed',
      details: error.message,
    });
  }
} 