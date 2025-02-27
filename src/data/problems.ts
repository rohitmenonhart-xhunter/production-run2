import { Problem } from '@/lib/utils';

export const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.
    
You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    difficulty: 'easy',
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        expectedOutput: '[0,1]',
      },
      {
        input: '[3,2,4]\n6',
        expectedOutput: '[1,2]',
      },
      {
        input: '[3,3]\n6',
        expectedOutput: '[0,1]',
      },
    ],
    sampleInput: '[2,7,11,15]\n9',
    sampleOutput: '[0,1]',
    timeLimit: 2000, // 2 seconds
    memoryLimit: 50, // 50 MB
  },
  {
    id: 'palindrome',
    title: 'Valid Palindrome',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.

Example:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.`,
    difficulty: 'easy',
    testCases: [
      {
        input: 'A man, a plan, a canal: Panama',
        expectedOutput: 'true',
      },
      {
        input: 'race a car',
        expectedOutput: 'false',
      },
      {
        input: ' ',
        expectedOutput: 'true',
      },
    ],
    sampleInput: 'A man, a plan, a canal: Panama',
    sampleOutput: 'true',
    timeLimit: 1000, // 1 second
    memoryLimit: 50, // 50 MB
  },
];

export function getProblem(id: string): Problem | undefined {
  return problems.find((p) => p.id === id);
}

export function getProblems(): Problem[] {
  return problems;
} 