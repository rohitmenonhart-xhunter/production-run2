import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/button/Button';

// Dynamically import Monaco Editor to avoid SSR issues
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

export default function CodingInterview() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(defaultCode[value as keyof typeof defaultCode]);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/coding/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      setOutput('Error running code. Please try again.');
    }
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Coding Evaluation - Mockello</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Coding Evaluation</h1>
          <div className="flex items-center gap-4">
            <div className="text-xl font-mono bg-black/40 px-4 py-2 rounded-lg">
              {formatTime(timeLeft)}
            </div>
            <Select
              value={language}
              onValueChange={handleLanguageChange}
              options={languages}
              className="w-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-[#BE185D]/20">
              <h2 className="text-xl font-semibold mb-4">Problem Statement</h2>
              <div className="prose prose-invert">
                {/* Problem statement will be dynamically loaded */}
                <p>Write a function that...</p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-[#BE185D]/20">
              <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
              {/* Test cases will be dynamically loaded */}
              <div className="space-y-2">
                <div className="p-2 border border-gray-700 rounded">
                  <p>Input: [1, 2, 3]</p>
                  <p>Expected Output: 6</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-[500px] bg-black/40 backdrop-blur-sm rounded-xl border border-[#BE185D]/20 overflow-hidden">
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
                onClick={handleRunCode}
                disabled={isRunning}
                className="bg-[#BE185D] flex-1"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button className="bg-green-600 flex-1">Submit Solution</Button>
            </div>

            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-[#BE185D]/20">
              <h3 className="text-lg font-semibold mb-2">Output</h3>
              <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 