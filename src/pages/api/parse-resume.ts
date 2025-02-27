import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ParsedResume {
  fullName?: string;
  email?: string;
  phone?: string;
  education: string[];
  experience: string[];
  skills: string[];
  projects: string[];
  achievements: string[];
  interests: string[];
}

interface PDFContent {
  text: string;
  fontSize?: number;
}

function extractSection(text: string, sectionName: string): string[] {
  const patterns = {
    education: /(?:EDUCATION|ACADEMIC|QUALIFICATION)(?:.*?)(?=(?:EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|INTERESTS|$))/is,
    experience: /(?:EXPERIENCE|WORK|EMPLOYMENT)(?:.*?)(?=(?:EDUCATION|SKILLS|PROJECTS|ACHIEVEMENTS|INTERESTS|$))/is,
    skills: /(?:SKILLS|EXPERTISE|TECHNOLOGIES|COMPETENCIES)(?:.*?)(?=(?:EDUCATION|EXPERIENCE|PROJECTS|ACHIEVEMENTS|INTERESTS|$))/is,
    projects: /(?:PROJECTS|PROJECT WORK|ASSIGNMENTS)(?:.*?)(?=(?:EDUCATION|EXPERIENCE|SKILLS|ACHIEVEMENTS|INTERESTS|$))/is,
    achievements: /(?:ACHIEVEMENTS|ACCOMPLISHMENTS|AWARDS)(?:.*?)(?=(?:EDUCATION|EXPERIENCE|SKILLS|PROJECTS|INTERESTS|$))/is,
    interests: /(?:INTERESTS|HOBBIES|ACTIVITIES)(?:.*?)(?=(?:EDUCATION|EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|$))/is,
  };

  const pattern = patterns[sectionName as keyof typeof patterns];
  if (!pattern) return [''];

  const match = text.match(pattern);
  if (!match) return [''];

  // Remove the section header and join all content
  const content = match[0]
    .replace(new RegExp(Object.keys(patterns).join('|'), 'i'), '')
    .trim()
    .split(/[•●\-\n]+/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .join('\n• ');

  return content ? [`• ${content}`] : [''];
}

async function extractTextWithFontSize(buffer: Buffer) {
  // Convert Buffer to Uint8Array
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1); // Get first page
  const textContent = await page.getTextContent();
  
  // Sort items by font size
  const items = textContent.items
    .map((item: any) => ({
      text: item.str.trim(),
      fontSize: item.transform[0], // Font size is usually in the transform matrix
    }))
    .filter(item => item.text.length > 0);

  // Sort by font size (largest first)
  items.sort((a, b) => b.fontSize - a.fontSize);
  
  return items;
}

async function parseFile(file: formidable.File): Promise<ParsedResume> {
  const buffer = fs.readFileSync(file.filepath);
  let text = '';
  let fullName = '';

  if (file.mimetype === 'application/pdf') {
    try {
      const items = await extractTextWithFontSize(buffer);
      
      // Find the first item with largest font that looks like a name
      for (const item of items) {
        const words = item.text.split(/\s+/);
        if (words.length >= 2 && 
            words.length <= 4 && 
            !item.text.includes('@') &&
            !item.text.toLowerCase().includes('resume') &&
            !item.text.toLowerCase().includes('cv') &&
            !/^\d/.test(item.text)) {
          fullName = item.text;
          break;
        }
      }
      
      // Get full text for other fields
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      text = textContent.items.map((item: any) => item.str).join(' ');
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      // Fallback to pdf-parse if PDF.js fails
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    }
  } else if (file.mimetype?.startsWith('image/')) {
    const worker = await createWorker();
    const { data: { text: ocrText } } = await worker.recognize(buffer);
    await worker.terminate();
    text = ocrText;
    
    // For images, try to find the largest text in first few lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    for (const line of lines) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && 
          words.length <= 4 && 
          !line.includes('@') &&
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv') &&
          !/^\d/.test(line)) {
        fullName = line;
        break;
      }
    }
  }

  // Improved phone number pattern
  const phonePattern = /(?:(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4})|(?:\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

  const parsed: ParsedResume = {
    fullName: "Please enter your full name manually",
    email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0],
    phone: "Please enter your phone number manually",
    education: extractSection(text, 'education'),
    experience: extractSection(text, 'experience'),
    skills: extractSection(text, 'skills'),
    projects: extractSection(text, 'projects'),
    achievements: extractSection(text, 'achievements'),
    interests: extractSection(text, 'interests'),
  };

  return parsed;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const file = files.resume?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Please upload a PDF or image file.' });
    }

    const parsedData = await parseFile(file);
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('Resume parsing error:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
} 