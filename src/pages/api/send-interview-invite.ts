import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      to,
      candidateName,
      sessionId,
      hrName,
      companyName,
      role,
      interviewLink
    } = req.body;

    if (!to || !candidateName || !sessionId || !hrName || !companyName || !role || !interviewLink) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Email template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #BE185D;">Interview Invitation from ${companyName}</h2>
        
        <p>Dear ${candidateName},</p>
        
        <p>You have been invited to an interview for the position of <strong>${role}</strong> at ${companyName}.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Interview Details:</strong></p>
          <ul style="list-style: none; padding-left: 0;">
            <li>Session ID: ${sessionId}</li>
            <li>HR Interviewer: ${hrName}</li>
            <li>Company: ${companyName}</li>
            <li>Position: ${role}</li>
          </ul>
        </div>

        <p>Please click the button below to start your interview:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${interviewLink}" 
             style="background-color: #BE185D; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Start Interview
          </a>
        </div>

        <div style="background-color: #fff3f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #BE185D;"><strong>Important Notes:</strong></p>
          <ul style="color: #4a5568;">
            <li>Please ensure you have a stable internet connection</li>
            <li>Use a quiet room with good lighting</li>
            <li>Test your camera and microphone before starting</li>
            <li>Keep your Session ID handy: ${sessionId}</li>
          </ul>
        </div>

        <p>Best regards,<br>${hrName}<br>${companyName}</p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Interview Invitation - ${companyName} - ${role}`,
      html,
    });

    return res.status(200).json({ message: 'Interview invitation sent successfully' });
  } catch (error) {
    console.error('Error sending interview invitation:', error);
    return res.status(500).json({ message: 'Failed to send interview invitation' });
  }
} 