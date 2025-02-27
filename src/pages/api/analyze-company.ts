import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CompanyAnalysis {
  name: string;
  logo: string;
  description: string;
  industry: string;
  specialties: string[];
  products: string[];
  founders: string[];
  mainServices: string[];
  technologies: string[];
  brandColors: string[];
  businessModel: string;
  targetMarket: string;
  competitiveAdvantages: string[];
  mainOfferings: string[];
  jobPostings: Array<{
    title: string;
    url: string;
  }>;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  officeLocations: string[];
}

async function scrapeWebsite(url: string): Promise<{ html: string; links: string[] }> {
  const visited = new Set<string>();
  const domain = new URL(url).hostname;
  const mainPageResponse = await axios.get(url);
  const $ = cheerio.load(mainPageResponse.data);
  
  // Get all internal links
  const links = new Set<string>();
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      try {
        const fullUrl = new URL(href, url);
        if (fullUrl.hostname === domain && !visited.has(fullUrl.toString())) {
          links.add(fullUrl.toString());
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });

  // Visit important pages (about, products, services)
  let allHtml = mainPageResponse.data;
  const importantPages = Array.from(links).filter(link => 
    link.toLowerCase().includes('about') || 
    link.toLowerCase().includes('product') || 
    link.toLowerCase().includes('service') ||
    link.toLowerCase().includes('team') ||
    link.toLowerCase().includes('company')
  );

  // Visit up to 5 important pages
  for (const link of importantPages.slice(0, 5)) {
    try {
      const response = await axios.get(link);
      allHtml += response.data;
      visited.add(link);
    } catch (e) {
      console.warn('Failed to fetch page:', link);
    }
  }

  return { html: allHtml, links: Array.from(links) };
}

function extractCompanyInfo($: cheerio.CheerioAPI): {
  founders: string[];
  technologies: string[];
  products: string[];
  services: string[];
  locations: string[];
} {
  const founders: Set<string> = new Set();
  const technologies: Set<string> = new Set();
  const products: Set<string> = new Set();
  const services: Set<string> = new Set();
  const locations: Set<string> = new Set();

  // Common founder indicators
  const founderKeywords = ['founder', 'ceo', 'president', 'director', 'chief'];
  
  // Common technology keywords
  const techKeywords = ['react', 'angular', 'vue', 'node', 'python', 'java', 'aws', 'cloud', 'ai', 'blockchain'];
  
  // Look for founder information
  $('*').each((_, element) => {
    const text = $(element).text().toLowerCase();
    const classes = $(element).attr('class') || '';
    
    // Check for founder mentions
    founderKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        const sentence = $(element).text().trim();
        if (sentence.length < 100) { // Avoid long paragraphs
          founders.add(sentence);
        }
      }
    });

    // Check for technologies
    techKeywords.forEach(tech => {
      if (text.includes(tech)) {
        technologies.add(tech);
      }
    });

    // Look for product names (usually in headings or specific product sections)
    const node = $(element).get(0);
    const isHeading = node && 'tagName' in node && 
      (node.tagName === 'h1' || node.tagName === 'h2' || node.tagName === 'h3');
    
    if (isHeading || classes.includes('product')) {
      const text = $(element).text().trim();
      if (text.length > 0 && text.length < 50) {
        products.add(text);
      }
    }

    // Look for services
    if (
      classes.includes('service') || 
      text.includes('we provide') || 
      text.includes('our services')
    ) {
      const text = $(element).text().trim();
      if (text.length > 0 && text.length < 100) {
        services.add(text);
      }
    }

    // Look for office locations
    if (
      text.includes('office') || 
      text.includes('location') || 
      text.includes('address')
    ) {
      const text = $(element).text().trim();
      if (text.length > 0 && text.length < 100) {
        locations.add(text);
      }
    }
  });

  return {
    founders: Array.from(founders),
    technologies: Array.from(technologies),
    products: Array.from(products),
    services: Array.from(services),
    locations: Array.from(locations)
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    // Scrape website and important pages
    const { html, links } = await scrapeWebsite(websiteUrl);
    const $ = cheerio.load(html);

    // Extract basic information
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const logoUrl = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
    
    // Extract detailed company information through web scraping
    const {
      founders,
      technologies,
      products,
      services,
      locations
    } = extractCompanyInfo($);

    // Extract colors
    const colors = new Set<string>();
    $('*').each((_: any, element: any) => {
      const styles = $(element).attr('style');
      const bgColor = $(element).css('background-color');
      const color = $(element).css('color');
      
      if (styles) {
        const colorMatches = styles.match(/#[0-9a-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/gi);
        if (colorMatches) {
          colorMatches.forEach((c: string) => colors.add(c));
        }
      }
      if (bgColor) colors.add(bgColor);
      if (color) colors.add(color);
    });

    // Extract social links
    const socialLinks = {
      linkedin: $('a[href*="linkedin.com"]').attr('href') || undefined,
      twitter: $('a[href*="twitter.com"]').attr('href') || undefined,
      facebook: $('a[href*="facebook.com"]').attr('href') || undefined,
    };

    // Extract job postings if available
    const jobPostings: Array<{ title: string; url: string }> = [];
    $('a').each((_: any, element: any) => {
      const href = $(element).attr('href');
      const text = $(element).text().toLowerCase();
      
      if (href && (
        text.includes('job') || 
        text.includes('career') || 
        text.includes('position') ||
        href.toLowerCase().includes('job') || 
        href.toLowerCase().includes('career') || 
        href.toLowerCase().includes('position')
      )) {
        try {
          const fullUrl = new URL(href, websiteUrl).toString();
          const jobTitle = $(element).text().trim();
          jobPostings.push({
            title: jobTitle || 'Job Opening',
            url: fullUrl,
          });
        } catch (e) {
          console.warn('Invalid job posting URL:', href);
        }
      }
    });

    // Use AI only for summarizing and organizing the scraped information
    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst. Analyze company information and return a detailed JSON response. Focus on providing comprehensive insights about the company's business model, value proposition, and market position."
        },
        {
          role: "user",
          content: `Analyze this company information and provide a detailed analysis in JSON format:

Website Title: ${title}
Meta Description: ${description}
Found Products: ${JSON.stringify(products)}
Services Offered: ${JSON.stringify(services)}
Technologies Used: ${JSON.stringify(technologies)}
Leadership/Team: ${JSON.stringify(founders)}
Locations: ${JSON.stringify(locations)}

Return a JSON object with:
{
  "description": "A comprehensive 3-4 sentence description of what the company does, their main value proposition, and their market position",
  "industry": "Primary industry they operate in",
  "specialties": ["List of 3-5 main areas of expertise"],
  "business_model": "Brief explanation of how they operate and deliver value",
  "target_market": "Description of their target customers/market",
  "competitive_advantages": ["List of 2-3 key competitive advantages"],
  "main_offerings": ["Organized list of their main products/services"]
}`
        }
      ]
    });

    const messageContent = aiAnalysis.choices[0].message.content;
    if (!messageContent) {
      throw new Error('AI analysis returned empty content');
    }
    
    let aiData;
    try {
      // Extract JSON object from the response using regex
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in AI response');
      }
      aiData = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse AI response:', messageContent);
      throw new Error('Invalid AI response format');
    }

    const companyData: CompanyAnalysis = {
      name: title.split('|')[0].trim(),
      logo: logoUrl ? new URL(logoUrl, websiteUrl).toString() : '',
      description: aiData.description || description,
      industry: aiData.industry || '',
      specialties: aiData.specialties || [],
      products: products,
      founders: founders,
      mainServices: services,
      technologies: technologies,
      brandColors: Array.from(colors),
      businessModel: aiData.business_model || '',
      targetMarket: aiData.target_market || '',
      competitiveAdvantages: aiData.competitive_advantages || [],
      mainOfferings: aiData.main_offerings || [],
      jobPostings,
      socialLinks,
      officeLocations: locations
    };

    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error analyzing company website:', error);
    res.status(500).json({ 
      error: 'Failed to analyze company website',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 