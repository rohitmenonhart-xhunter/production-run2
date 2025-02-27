import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Open the default email client with pre-filled content
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(html.replace(/<[^>]*>/g, ''))}`;

    return res.status(200).json({ 
      success: true, 
      mailtoLink,
      message: 'Email client opened successfully'
    });
  } catch (error) {
    console.error('Error handling email:', error);
    return res.status(500).json({ message: 'Failed to process email request' });
  }
} 