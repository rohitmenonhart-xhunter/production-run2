import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';

export default function InterviewComplete() {
  // Clear session data on mount
  useEffect(() => {
    localStorage.removeItem('transcriptions');
    localStorage.removeItem('sessionTimeLeft');
    localStorage.removeItem('sessionStartTime');
  }, []);

  return (
    <>
      <Head>
        <title>Interview Complete - Mockello</title>
        <meta name="description" content="Your interview has been completed successfully" />
      </Head>

      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0">
          {/* Subtle dot pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#BE185D_0.8px,transparent_0.8px)] [background-size:16px_16px] opacity-[0.15]"></div>
        </div>

        <motion.div 
          className="relative z-10 max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-[#BE185D] rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            Interview Completed Successfully!
          </h1>

          <p className="text-gray-600 mb-6 text-lg">
            Thank you for completing your interview with Mockello. Your responses have been recorded and will be reviewed by our HR team.
          </p>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#BE185D]">What's Next?</h2>
            <ul className="text-left text-gray-600 space-y-3">
              <li className="flex items-start">
                <span className="mr-2 text-[#BE185D]">•</span>
                Your interview performance will be evaluated by our HR team
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-[#BE185D]">•</span>
                If selected, you will be contacted for a live HR interview
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-[#BE185D]">•</span>
                The results will be communicated through your registered contact details
              </li>
            </ul>
          </div>

          <Link 
            href="/"
            className="inline-block bg-[#BE185D] hover:bg-[#BE185D]/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </motion.div>
      </main>
    </>
  );
} 