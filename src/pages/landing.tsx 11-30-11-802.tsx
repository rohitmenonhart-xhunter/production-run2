import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Inter } from 'next/font/google';
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, query, orderByChild, equalTo, set } from 'firebase/database';
import Image from 'next/image';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuWTdQuHs_l6rvfzaxvY4y-Uzn0EARRwM",
  authDomain: "athentication-3c73e.firebaseapp.com",
  databaseURL: "https://athentication-3c73e-default-rtdb.firebaseio.com",
  projectId: "athentication-3c73e",
  storageBucket: "athentication-3c73e.firebasestorage.app",
  messagingSenderId: "218346867452",
  appId: "1:218346867452:web:58a57b37f6b6a42ec72579",
  measurementId: "G-3GBM5TSMLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

interface FirebaseData {
  sessionId: string;
  candidateMockelloId: string;
  candidateName: string;
  candidateRole: string;
  roleplayPrompt?: string;
  hrName?: string;
  hrCompany?: string;
  [key: string]: any;
}

interface SessionData {
  sessionId: string;
  candidateMockelloId: string;
  candidateName: string;
  candidateRole: string;
  roleplayPrompt: string;
  hrName: string;
  hrCompany: string;
}

interface CandidateSession {
  sessionId: string;
  mockelloId: string;
  candidateName: string;
  candidateRole: string;
}

interface SessionInfo {
  sessionId: string;
  role: string;
  createdAt?: string;
  hrName?: string;
  company?: string;
  studentLimit: number;
  currentStudents?: number;
  invitedEmails?: string[];
}

const getRoomNumber = (role: string): string => {
  const roleRoomMap: { [key: string]: string } = {
    'Fullstack developer': '001',
    'DevOps': '002',
    'Frontend developer': '003',
    'Backend developer': '004',
    'Software Engineer': '005',
    'Data Engineer': '006',
    'Machine Learning Engineer': '007',
    'Cloud Engineer': '008',
    'System Administrator': '009',
    'QA Engineer': '010',
    'Electronics Engineer': '011',
    'Electrical Engineer': '012',
    'Mechanical Engineer': '013',
    'Civil Engineer': '014',
    'Product Manager': '015',
    'Project Manager': '016',
    'UI/UX Designer': '017',
    'Database Administrator': '018',
    'Security Engineer': '019',
    'Network Engineer': '020'
  };

  return roleRoomMap[role] || '999'; // Default room if role not found
};

export default function LandingPage() {
  const router = useRouter();
  const [mockelloId, setMockelloId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get reference to sessions in Firebase
      const sessionsRef = ref(database, 'sessions');
      const snapshot = await get(sessionsRef);

      if (!snapshot.exists()) {
        setError('No active sessions found');
        setLoading(false);
        return;
      }

      let foundSession: CandidateSession | null = null;

      // Search through sessions to find matching Mockello ID
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data && data.candidateMockelloId === mockelloId) {
          foundSession = {
            sessionId: data.sessionId || '',
            mockelloId: mockelloId,
            candidateName: data.candidateName || '',
            candidateRole: data.candidateRole || ''
          };
          return true; // Break the loop
        }
      });

      if (foundSession) {
        // Store session data in localStorage
        localStorage.setItem('candidate_session', JSON.stringify(foundSession));

        // Redirect to interview page
        router.push('/interview');
      } else {
        setError('Invalid Mockello ID. Please check and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-black ${inter.className}`}>
      <Head>
        <title>Welcome to Mockello</title>
        <meta name="description" content="Enter your Mockello ID to begin the interview" />
      </Head>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#BE185D]/20 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[#BE185D]/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full max-w-md"
        >
          <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-[#BE185D]/20">
            <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">
              Welcome to Mockello
            </h1>
            
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-400">
                  Enter your Mockello ID to start your interview
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <input
                  type="text"
                  value={mockelloId}
                  onChange={(e) => setMockelloId(e.target.value)}
                  placeholder="Enter your Mockello ID"
                  className="w-full px-4 py-3 bg-black/50 border border-[#BE185D]/20 rounded-lg focus:outline-none focus:border-[#BE185D] transition-colors text-white"
                  required
                />
                
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80 text-white rounded-lg hover:shadow-[0_0_30px_-5px_#BE185D] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Start Interview'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-400">
                <p>Don't have a Mockello ID?</p>
                <Link 
                  href="/resume-parser"
                  className="text-[#BE185D] hover:text-[#BE185D]/80 mt-1 inline-block"
                >
                  Click here to get your Mockello ID →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 