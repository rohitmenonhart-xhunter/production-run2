import { createHash } from 'crypto';

export function generateMockelloId(companyData: {
  companyName: string | undefined;
  industry?: string | undefined;
  description?: string | undefined;
}): string {
  // Combine company data into a string with default values for optional fields
  const dataString = `${companyData.companyName || 'company'}-${companyData.industry || ''}-${companyData.description || ''}-${Date.now()}`;
  
  // Create a hash of the data
  const hash = createHash('sha256').update(dataString).digest('hex');
  
  // Take first 8 characters and convert to uppercase
  const baseId = hash.slice(0, 8).toUpperCase();
  
  // Add 'MCK' prefix to make it more recognizable
  return `MCK${baseId}`;
} 