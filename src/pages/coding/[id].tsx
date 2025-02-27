import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getProblem } from '@/data/problems';
import { Problem, TestCase, validateOutput, formatExecutionTime } from '@/lib/utils';

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];

const defaultCode = {
  python: '# Write your Python code here\n\ndef solution():\n    pass',
  javascript: '// Write your JavaScript code here\n\nfunction solution() {\n}',
  java: '// Write your Java code here\n\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}',
  cpp: '// Write your C++ code here\n\n#include <iostream>\n\nint main() {\n    return 0;\n}',
  go: '// Write your Go code here\n\npackage main\n\nfunc main() {\n}',
};

interface TestResult {
  passed: boolean;
  output: string;
  expectedOutput: string;
  executionTime: number;
}

export default function CodingProblem() {
  const router = useRouter();
  const { id } = router.query;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'testcases'>('description');

  useEffect(() => {
    if (id && typeof id === 'string') {
      const problemData = getProblem(id);
      if (problemData) {
        setProblem(problemData);
      } else {
        router.push('/coding');
      }
    }
  }, [id, router]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(defaultCode[value as keyof typeof defaultCode]);
  };

  const runTests = async () => {
    if (!problem) return;

    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      for (const testCase of problem.testCases) {
        const startTime = performance.now();
        const response = await fetch('/api/coding/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, input: testCase.input }),
        });

        const data = await response.json();
        const executionTime = performance.now() - startTime;

        results.push({
          passed: validateOutput(data.output, testCase.expectedOutput),
          output: data.output,
          expectedOutput: testCase.expectedOutput,
          executionTime,
        });
      }
    } catch (error) {
      console.error('Error running tests:', error);
    }

    setTestResults(results);
    setIsRunning(false);
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#BE185D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>{problem.title} - Mockello Coding</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{problem.title}</h1>
            <div className="mt-2 flex items-center gap-4">
              <span className={`font-medium capitalize ${
                problem.difficulty === 'easy' ? 'text-green-500' :
                problem.difficulty === 'medium' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {problem.difficulty}
              </span>
              <span className="text-gray-400">
                Time Limit: {problem.timeLimit / 1000}s
              </span>
              <span className="text-gray-400">
                Memory Limit: {problem.memoryLimit}MB
              </span>
            </div>
          </div>
          <Select
            value={language}
            onValueChange={handleLanguageChange}
            options={languages}
            className="w-40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-[#BE185D]/20">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'description'
                      ? 'bg-[#BE185D] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('testcases')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'testcases'
                      ? 'bg-[#BE185D] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Test Cases
                </button>
              </div>

              {activeTab === 'description' ? (
                <div className="prose prose-invert">
                  <p className="whitespace-pre-wrap">{problem.description}</p>
                  {problem.sampleInput && (
                    <>
                      <h3>Sample Input:</h3>
                      <pre className="bg-black/40 p-4 rounded">{problem.sampleInput}</pre>
                    </>
                  )}
                  {problem.sampleOutput && (
                    <>
                      <h3>Sample Output:</h3>
                      <pre className="bg-black/40 p-4 rounded">{problem.sampleOutput}</pre>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        result.passed ? 'bg-green-900/40' : 'bg-red-900/40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                          Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </span>
                        <span className="text-gray-400">
                          {formatExecutionTime(result.executionTime)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400">Input:</span>
                          <pre className="bg-black/40 p-2 rounded mt-1">
                            {problem.testCases[index].input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected Output:</span>
                          <pre className="bg-black/40 p-2 rounded mt-1">
                            {result.expectedOutput}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-400">Your Output:</span>
                          <pre className="bg-black/40 p-2 rounded mt-1">
                            {result.output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-[600px] bg-black/40 backdrop-blur-sm rounded-xl border border-[#BE185D]/20 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="bg-[#BE185D] flex-1"
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </Button>
              <Button className="bg-green-600 flex-1">Submit Solution</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 