import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  testCases: TestCase[];
  sampleInput?: string;
  sampleOutput?: string;
  timeLimit: number; // in milliseconds
  memoryLimit: number; // in MB
}

export function validateOutput(
  actualOutput: string,
  expectedOutput: string,
  strict = true
): boolean {
  if (strict) {
    return actualOutput.trim() === expectedOutput.trim();
  }
  
  // Normalize whitespace and compare
  const normalizeOutput = (output: string) =>
    output
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  
  return normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);
}

export function formatExecutionTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatMemoryUsage(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)}MB`;
} 