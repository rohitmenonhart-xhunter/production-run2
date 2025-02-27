import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Inter } from 'next/font/google';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

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

// Animation variants
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

const fadeIn = {
  initial: { 
    opacity: 0
  },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.8
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

interface SessionData {
  sessionId: string;
  mockelloId: string;
  candidateName: string;
  candidateEmail?: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  roleplayPrompt?: string;
  feedback?: string | null;
  performancePercentage?: number | null;
}

interface StoredSessionData {
  sessionId: string;
  mockelloId: string;
  candidateName: string;
  timestamp: number;
}

export default function InterviewPage() {
  const router = useRouter();
  const [mockelloId, setMockelloId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCameraCheck, setShowCameraCheck] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);

  const verifyMockelloId = async (e: React.FormEvent) => {
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

      let foundSession = false;
      let foundSessionId = '';
      let foundSessionData: SessionData | null = null;

      // Search directly in the sessions node
      const sessions = snapshot.val() as { [key: string]: SessionData };
      for (const [sessionId, session] of Object.entries(sessions) as [string, SessionData][]) {
        if (session.mockelloId === mockelloId) {
          foundSession = true;
          foundSessionId = sessionId;
          foundSessionData = session;
          break;
        }
      }

      if (foundSession && foundSessionData) {
        // Store session data in localStorage for future use
        const sessionData: StoredSessionData = {
          sessionId: foundSessionId,
          mockelloId,
          candidateName: foundSessionData.candidateName,
          timestamp: Date.now()
        };
        localStorage.setItem('candidate_session', JSON.stringify(sessionData));
        
        setSessionId(foundSessionId);
        setShowCameraCheck(true);
      } else {
        setError('You have not been selected for an interview yet. Please check back later.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred while verifying your Mockello ID');
    } finally {
      setLoading(false);
    }
  };

  // Function to check camera
  const checkCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraAvailable(true);
      setShowStartButton(true);
      // Store camera enabled status
      localStorage.setItem('camera_enabled', 'true');
      return stream;
    } catch (error) {
      console.error('Camera error:', error);
      setError('Camera access denied. Please enable camera access and try again.');
      setIsCameraAvailable(false);
      return null;
    }
  };

  // Function to handle start interview
  const handleStartInterview = () => {
    // Store session data before redirecting
    if (sessionId) {
      const sessionData = {
        sessionId,
        mockelloId,
        timestamp: Date.now()
      };
      localStorage.setItem('candidate_session', JSON.stringify(sessionData));
      // Use router.push instead of router.replace to allow back navigation
      router.push('/test');
    }
  };

  // Security check - verify user came from landing page
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Get session data
        const candidateSession = localStorage.getItem('candidate_session');
        
        // If no session exists, allow the user to enter Mockello ID
        if (!candidateSession) {
          console.log('No existing session found - allowing new session creation');
          return;
        }

        // Clear any invalid or expired sessions
        localStorage.removeItem('candidate_session');
        
      } catch (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('candidate_session');
      }
    };

    verifySession();
  }, []);

  // Clean up media streams when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionId || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!sessionId) {
    return (
      <div className={`min-h-screen bg-white ${inter.className}`}>
        <Head>
          <title>Verify Mockello ID - Mockello</title>
          <meta name="description" content="Verify your Mockello ID" />
        </Head>

        {/* Enhanced Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -inset-[10%] animate-[move_20s_linear_infinite]">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_30%)] opacity-10 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_30%)] opacity-10 animate-pulse delay-300"></div>
            <div className="absolute bottom-1/4 left-2/3 w-96 h-96 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_30%)] opacity-10 animate-pulse delay-700"></div>
          </div>
          
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_40%)] opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_40%)] opacity-20 animate-[float_12s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_40%)] opacity-20 animate-[float_10s_ease-in-out_infinite_200ms]"></div>
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#BE185D1A_1px,transparent_1px),linear-gradient(to_bottom,#BE185D1A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes move {
            0% { transform: translate(0, 0); }
            50% { transform: translate(5%, 5%); }
            100% { transform: translate(0, 0); }
          }
        `}</style>

        <main className="container mx-auto px-4 min-h-screen flex items-center justify-center relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="w-full max-w-md"
          >
            <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-[#BE185D]/10">
              <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80">
                Mockello
              </h1>
              
              <h2 className="text-2xl font-semibold mb-2 text-center text-gray-800">
                Verify Your ID
              </h2>
              
              <p className="text-gray-600 text-center mb-8">
                Enter your Mockello ID to begin your interview journey
              </p>

              <form onSubmit={verifyMockelloId} className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                  <input
                    type="text"
                    value={mockelloId}
                    onChange={(e) => setMockelloId(e.target.value)}
                    placeholder="Enter your Mockello ID"
                    className="relative w-full px-4 py-3 bg-white border-2 border-transparent rounded-lg focus:outline-none focus:border-[#BE185D] transition-all duration-300 text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
                
                {error && (
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-red-500/20 rounded-lg blur opacity-20"></div>
                    <p className="relative text-red-500 text-sm text-center bg-white px-4 py-3 rounded-lg border border-red-200">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full px-6 py-3 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/90 text-white rounded-lg hover:shadow-lg hover:from-[#BE185D] hover:to-[#BE185D] transition-all duration-300 disabled:opacity-50 font-medium"
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
                    'Check Status'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-2">Don't have a Mockello ID?</p>
                <Link 
                  href="/resume-parser"
                  className="inline-flex items-center text-[#BE185D] hover:text-[#BE185D]/80 font-medium group"
                >
                  <span>Get your Mockello ID</span>
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <Head>
        <title>Interview Preparation - Mockello</title>
        <meta name="description" content="Prepare for your interview" />
      </Head>

      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -inset-[10%] animate-[move_20s_linear_infinite]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_30%)] opacity-10 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_30%)] opacity-10 animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-2/3 w-96 h-96 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_30%)] opacity-10 animate-pulse delay-700"></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_40%)] opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_40%)] opacity-20 animate-[float_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-[radial-gradient(circle_at_center,_#BE185D_0%,_transparent_40%)] opacity-20 animate-[float_10s_ease-in-out_infinite_200ms]"></div>
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#BE185D1A_1px,transparent_1px),linear-gradient(to_bottom,#BE185D1A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes move {
          0% { transform: translate(0, 0); }
          50% { transform: translate(5%, 5%); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      <main className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Session Info Section */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80">
              Mockello
            </h1>
            <h2 className="text-4xl font-bold mb-2 text-gray-800">
              Congratulations!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              You have been selected for an interview
            </p>
            <div className="relative inline-block group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/50 rounded-xl blur opacity-20"></div>
              <div className="relative bg-white px-6 py-4 rounded-xl border border-[#BE185D]/10">
                <div className="flex items-center gap-3">
                  <p className="text-gray-700">Your Session ID: <span className="text-[#BE185D] font-mono font-medium">{sessionId}</span></p>
                  <button
                    onClick={copyToClipboard}
                    className="relative group/copy inline-flex items-center justify-center p-2 rounded-lg hover:bg-[#BE185D]/5 transition-all duration-200"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D] group-hover/copy:text-[#BE185D]/80" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/copy:opacity-100 transition-opacity duration-200">
                      {copied ? 'Copied!' : 'Copy ID'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Camera Check Section */}
          {showCameraCheck && (
            <motion.div
              variants={fadeInUp}
              className="relative mb-12 group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/50 rounded-2xl blur opacity-20"></div>
              <div className="relative p-8 bg-white shadow-lg rounded-2xl border border-[#BE185D]/10">
                <h2 className="text-2xl font-bold text-[#BE185D] mb-6">Camera Check</h2>
                <div className="aspect-video max-w-2xl mx-auto bg-gray-50 rounded-lg overflow-hidden mb-6 border border-[#BE185D]/10">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                {error && (
                  <div className="relative mb-6">
                    <div className="absolute -inset-0.5 bg-red-500/20 rounded-lg blur opacity-20"></div>
                    <p className="relative text-red-500 text-sm text-center bg-white px-4 py-3 rounded-lg border border-red-200">
                      {error}
                    </p>
                  </div>
                )}
                {!isCameraAvailable && (
                  <div className="text-center">
                    <button
                      onClick={checkCamera}
                      className="px-6 py-3 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/90 text-white rounded-lg hover:shadow-lg hover:from-[#BE185D] hover:to-[#BE185D] transition-all duration-300 font-medium"
                    >
                      Enable Camera
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Interview Tips */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/50 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative p-6 bg-white shadow-lg rounded-xl border border-[#BE185D]/10">
                <h3 className="text-xl font-bold text-[#BE185D] mb-4">Technical Tips</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Ensure stable internet connection
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Use Chrome or Firefox browser
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Keep your camera at eye level
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Test audio and video beforehand
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Have a plain background
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/50 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative p-6 bg-white shadow-lg rounded-xl border border-[#BE185D]/10">
                <h3 className="text-xl font-bold text-[#BE185D] mb-4">Interview Tips</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Speak clearly and confidently
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Maintain eye contact with camera
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Listen carefully to questions
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Take time to think before answering
                  </li>
                  <li className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 bg-[#BE185D] rounded-full mr-3"></span>
                    Show enthusiasm and positivity
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Start Interview Button */}
          {showStartButton && (
            <motion.div
              variants={fadeIn}
              className="text-center"
            >
              <button
                onClick={handleStartInterview}
                className="px-8 py-4 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/90 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:from-[#BE185D] hover:to-[#BE185D] transition-all duration-300"
              >
                Start Interview
              </button>
              <p className="mt-4 text-gray-500 text-sm">
                Make sure you're ready before starting the interview
              </p>
            </motion.div>
          )}

          {/* Warning Section */}
          <motion.div
            variants={fadeInUp}
            className="relative mt-12"
          >
            <div className="absolute -inset-0.5 bg-red-500/20 rounded-lg blur opacity-20"></div>
            <div className="relative p-4 bg-white border border-red-200 rounded-lg text-center">
              <p className="text-red-500 text-sm">
                <span className="font-bold">⚠️ Warning:</span> Do not refresh or close this page during the interview.
                Doing so may result in session termination.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 