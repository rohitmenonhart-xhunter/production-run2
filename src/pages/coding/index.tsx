import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProblems } from '@/data/problems';
import { Problem } from '@/lib/utils';

export default function CodingProblems() {
  const [problems] = useState<Problem[]>(getProblems());

  const getDifficultyColor = (difficulty: Problem['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Coding Problems - Mockello</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Coding Problems</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Hard</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-[#BE185D]/20 hover:border-[#BE185D]/40 transition-colors"
            >
              <Link
                href={`/coding/${problem.id}`}
                className="flex items-center justify-between group"
              >
                <div>
                  <h2 className="text-xl font-semibold group-hover:text-[#BE185D] transition-colors">
                    {problem.title}
                  </h2>
                  <p className="text-gray-400 mt-2 line-clamp-2">
                    {problem.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`font-medium capitalize ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                  <div className="text-sm text-gray-400">
                    Time: {problem.timeLimit / 1000}s | Memory: {problem.memoryLimit}MB
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
} 