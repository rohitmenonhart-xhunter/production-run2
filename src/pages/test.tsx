import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from 'next';
import { ref, set } from "firebase/database";
import { database } from "@/utils/firebase";
import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ConnectionState } from "livekit-client";

import { PlaygroundConnect } from "@/components/PlaygroundConnect";
import Playground from "@/components/playground/Playground";
import { PlaygroundToast } from "@/components/toast/PlaygroundToast";
import { ConfigProvider, useConfig } from "@/hooks/useConfig";
import { ConnectionMode, ConnectionProvider, useConnection } from "@/hooks/useConnection";
import { ToastProvider, useToast } from "@/components/toast/ToasterProvider";
import { logout } from "@/utils/auth";

const themeColors = {
  primary: "#BE185D",
  background: "#111827",
  surface: "#1F2937",
  text: "#F3F4F6",
  textSecondary: "#9CA3AF",
  border: "#374151",
  accent: "#EC4899"
};

// Add theme colors array for components that expect array format
const themeColorsArray = [themeColors.primary];

const inter = Inter({ subsets: ["latin"] });

export default function Test() {
  return (
    <>
      <style jsx global>{`
        body {
          background-color: ${themeColors.background};
          color: ${themeColors.text};
        }
        
        .dark-theme {
          --primary: ${themeColors.primary};
          --background: ${themeColors.background};
          --surface: ${themeColors.surface};
          --text: ${themeColors.text};
          --text-secondary: ${themeColors.textSecondary};
          --border: ${themeColors.border};
          --accent: ${themeColors.accent};
        }

        .fullscreen-prompt {
          background-color: ${themeColors.surface};
          border: 1px solid ${themeColors.border};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .fullscreen-button {
          background-color: ${themeColors.primary};
          color: ${themeColors.text};
          transition: all 0.2s ease-in-out;
        }

        .fullscreen-button:hover {
          background-color: ${themeColors.accent};
          transform: translateY(-1px);
        }

        .playground-container {
          background-color: ${themeColors.surface};
          border: 1px solid ${themeColors.border};
        }

        .timer {
          color: ${themeColors.accent};
          font-weight: 600;
        }
      `}</style>
      <ToastProvider>
        <ConfigProvider>
          <ConnectionProvider>
            <TestInner />
          </ConnectionProvider>
        </ConfigProvider>
      </ToastProvider>
    </>
  );
}

const calculatePerformancePercentage = (summary: string, transcriptionCount: number, totalWords: number): number => {
  // Base score from star rating - make it harder to get high scores
  const stars = summary.match(/★+½?(?=☆|$)/)?.[0] || '';
  const fullStars = (stars.match(/★/g) || []).length;
  const hasHalf = stars.includes('½');
  const starScore = ((fullStars + (hasHalf ? 0.5 : 0)) / 5) * 100;

  // Stricter participation score
  const participationScore = Math.min(85, (transcriptionCount * 5)); // 5 points per response, max 85

  // Stricter word score - require more words for points
  const wordScore = Math.min(80, (totalWords / 10)); // 1 point per 10 words, max 80

  // Weight the scores with higher emphasis on star rating
  const weightedScore = (starScore * 0.7) + (participationScore * 0.15) + (wordScore * 0.15);
  
  // Apply a curve to make high scores harder to achieve
  const curvedScore = Math.pow(weightedScore / 100, 1.2) * 100;
  
  // Return rounded percentage, capped at 95%
  return Math.min(95, Math.round(curvedScore));
};

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
      duration: 0.6,
      ease: "easeOut"
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
      duration: 0.8,
      ease: "easeOut"
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

export function TestInner() {
  const router = useRouter();
  const { shouldConnect, wsUrl, token, mode, connect, disconnect } =
    useConnection();
  
  const {config} = useConfig();
  const { toastMessage, setToastMessage } = useToast();
  const [roomState, setRoomState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [hasExitedFullscreenOnce, setHasExitedFullscreenOnce] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenReturnPrompt, setShowFullscreenReturnPrompt] = useState(false);
  
  // Add new state for initial screen
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowFullscreenPrompt(false);
        setShowFullscreenReturnPrompt(false);
      }
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
      setToastMessage({
        type: 'error',
        message: 'Failed to enter fullscreen mode. Please try again.'
      });
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isInFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isInFullscreen);

      if (!isInFullscreen && !showFullscreenPrompt) {
        if (!hasExitedFullscreenOnce) {
          // First exit - Show warning and return button
          setHasExitedFullscreenOnce(true);
          setShowFullscreenReturnPrompt(true);
          setToastMessage({
            type: 'error',
            message: 'Please return to fullscreen mode. The session will be terminated if you exit fullscreen again.'
          });
        } else {
          // Second exit - Terminate session
          setToastMessage({
            type: 'error',
            message: 'Session terminated due to exiting fullscreen mode twice.'
          });
          
          // Clear data and force redirect
          localStorage.removeItem('transcriptions');
          localStorage.removeItem('sessionTimeLeft');
          localStorage.removeItem('sessionStartTime');
          window.location.href = '/unfollowingrules';
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasExitedFullscreenOnce, setToastMessage, showFullscreenPrompt]);

  // Prevent F11 key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Security check - verify user came from landing page
  useEffect(() => {
    const candidateSession = localStorage.getItem('candidate_session');
    if (!candidateSession) {
      console.warn('No candidate session found');
      return;
    }

    try {
      const parsedSession = JSON.parse(candidateSession);
      if (!parsedSession || !parsedSession.sessionId) {
        console.warn('Invalid session data structure');
        return;
      }
    } catch (error) {
      console.error('Failed to parse session data:', error);
      return;
    }
  }, []);

  // Initialize with default value for SSR
  const [timeLeft, setTimeLeft] = useState(14 * 60);
  const [hasMounted, setHasMounted] = useState(false);
  const [transcriptionSummary, setTranscriptionSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isFeedbackSaved, setIsFeedbackSaved] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // Update room state when connection changes
  useEffect(() => {
    if (shouldConnect) {
      setRoomState(ConnectionState.Connected);
    } else {
      setRoomState(ConnectionState.Disconnected);
    }
  }, [shouldConnect]);

  // Handle initial timer setup after mount
  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem('sessionTimeLeft');
      const savedStartTime = localStorage.getItem('sessionStartTime');
      
      if (savedTime && savedStartTime) {
        const elapsedSinceLastSave = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
        const remainingTime = Math.max(0, parseInt(savedTime) - elapsedSinceLastSave);
        setTimeLeft(remainingTime);
      } else {
        const SESSION_DURATION = 14 * 60;  // 14 minutes
        localStorage.setItem('sessionStartTime', Date.now().toString());
        localStorage.setItem('sessionTimeLeft', SESSION_DURATION.toString());
      }
    }
  }, []);

  // Function to generate and save feedback
  const generateAndSaveFeedback = useCallback(async () => {
    console.log("=== Starting Feedback Generation Process ===");
    setGenerationProgress('Initializing feedback generation...');
    
    try {
      // Try to get sessionId from candidate_session first
      const candidateSession = localStorage.getItem('candidate_session');
      let sessionId = null;
      let candidateInfo = null;
      
      if (candidateSession) {
        try {
          const parsedSession = JSON.parse(candidateSession);
          if (parsedSession && parsedSession.sessionId) {
            sessionId = parsedSession.sessionId;
            candidateInfo = {
              mockelloId: parsedSession.mockelloId,
              candidateName: parsedSession.candidateName
            };
            // Store it in sessionId for consistency
            localStorage.setItem('sessionId', sessionId);
            console.log("Retrieved session ID from candidate_session:", sessionId);
          }
        } catch (error) {
          console.error("Failed to parse candidate session:", error);
        }
      }

      // Fallback to direct sessionId if not found in candidate_session
      if (!sessionId) {
        sessionId = localStorage.getItem('sessionId');
      }

      console.log("Checking session ID:", { hasSessionId: !!sessionId, sessionId });
      
      if (!sessionId) {
        throw new Error("Session ID not found");
      }

      setGenerationProgress('Collecting transcriptions...');
      const transcriptions = localStorage.getItem('transcriptions');
      console.log("Checking transcriptions:", { 
        hasTranscriptions: !!transcriptions,
        transcriptionCount: transcriptions ? JSON.parse(transcriptions).length : 0 
      });

      if (!transcriptions) {
        throw new Error("No transcriptions found");
      }

      let parsedTranscriptions;
      try {
        parsedTranscriptions = JSON.parse(transcriptions);
        console.log(`Successfully parsed ${parsedTranscriptions.length} transcriptions`);
        console.log("Sample transcription:", parsedTranscriptions[0]);
      } catch (error) {
        console.error("Failed to parse transcriptions:", error);
        throw new Error("Failed to parse transcriptions");
      }

      if (!parsedTranscriptions || parsedTranscriptions.length === 0) {
        throw new Error("No valid transcriptions to process");
      }

      setIsGeneratingSummary(true);
      setGenerationProgress('Analyzing interview responses...');
      
      // Determine the API URL based on environment
      const apiUrl = process.env.NODE_ENV === 'development'
        ? `http://localhost:${window.location.port}/api/summarize`
        : '/api/summarize';

      console.log("Making API request to:", apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcriptions: parsedTranscriptions,
          isHREvaluation: true,
          sessionId
        }),
      });

      if (!response.ok) {
        console.error("API response error:", response.status, response.statusText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      setGenerationProgress('Processing feedback...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let summary = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'error') {
              throw new Error(data.error || 'Unknown error occurred');
            }
            
            if (data.type === 'chunk') {
              summary += data.content;
              // Update UI with partial summary if needed
            } else if (data.type === 'complete') {
              summary = data.summary;
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }

      if (!summary || summary.trim() === '') {
        throw new Error('No valid feedback generated');
      }

      const performancePercentage = calculatePerformancePercentage(
        summary,
        parsedTranscriptions.length,
        parsedTranscriptions.reduce((acc: number, curr: any) => 
          acc + (curr.message ? curr.message.split(' ').length : 0), 0)
      );

      // Get HR ID from candidate session
      let hrId = null;
      if (candidateSession) {
        try {
          const parsedSession = JSON.parse(candidateSession);
          hrId = parsedSession.hrId;
        } catch (error) {
          console.error('Error parsing candidate session for HR ID:', error);
        }
      }

      const feedbackData = {
        sessionId: sessionId,
        registerNumber: 'candidate', // Default for guest sessions
        name: 'Guest User',     // Default for guest sessions
        feedback: summary,
        timestamp: new Date().toISOString(),
        stars: summary.match(/★+½?(?=☆|$)/)?.[0]?.length || 0,
        performancePercentage: performancePercentage,
        interviewDate: new Date().toLocaleDateString(),
        interviewTime: new Date().toLocaleTimeString(),
        transcriptionCount: parsedTranscriptions.length,
        totalWords: parsedTranscriptions.reduce((acc: number, curr: any) => 
          acc + (curr.message ? curr.message.split(' ').length : 0), 0),
        hrId: hrId  // Add HR ID from candidate session
      };

      // Save to both Firebase locations
      const sessionFeedbackRef = ref(database, `sessionsfeedback/${sessionId}`);
      const guestFeedbackRef = ref(database, `interview_feedback/candidates/${sessionId}`);

      await Promise.all([
        set(sessionFeedbackRef, feedbackData),
        set(guestFeedbackRef, feedbackData)
      ]);

      // Save complete transcript to MongoDB
      const transcriptData = {
        sessionId,
        candidateInfo,
        transcriptions: parsedTranscriptions,
        feedback: feedbackData,
        performanceMetrics: {
          totalMessages: parsedTranscriptions.length,
          totalWords: parsedTranscriptions.reduce((acc: number, curr: any) => 
            acc + (curr.message ? curr.message.split(' ').length : 0), 0),
          performancePercentage
        }
      };

      // Save to MongoDB
      await fetch('/api/save-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcriptData),
      });

      console.log("Feedback and transcript saved successfully:", feedbackData);
      setIsFeedbackSaved(true);
      setGenerationProgress('Feedback saved successfully!');
      
      // Redirect to completion page
      router.push('/interview-complete');
    } catch (error) {
      console.error("Error in feedback generation:", error);
      setToastMessage({
        message: error instanceof Error ? error.message : "An error occurred while generating feedback. Please try again.",
        type: "error"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [setToastMessage, router, setIsGeneratingSummary, setIsFeedbackSaved]);

  // Timer effect
  useEffect(() => {
    if (!hasMounted) return;
    
    const SESSION_DURATION = 14 * 60;  // 14 minutes
    const FEEDBACK_TIME = 120; // 2 minutes

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        console.log(`Timer update: ${newTime} seconds remaining`);
        localStorage.setItem('sessionTimeLeft', newTime.toString());
        
        // Check if we've reached 2 minutes remaining
        if (newTime === FEEDBACK_TIME) {
          console.log(`Reached feedback time (${FEEDBACK_TIME} seconds). isFeedbackSaved: ${isFeedbackSaved}`);
        }
        if (newTime === FEEDBACK_TIME && !isFeedbackSaved) {
          console.log("Attempting to trigger feedback generation...");
          
          // Try to get sessionId from candidate_session first
          const candidateSession = localStorage.getItem('candidate_session');
          let sessionId = null;
          
          if (candidateSession) {
            try {
              const parsedSession = JSON.parse(candidateSession);
              if (parsedSession && parsedSession.sessionId) {
                sessionId = parsedSession.sessionId;
                // Store it in sessionId for consistency
                localStorage.setItem('sessionId', sessionId);
                console.log("Retrieved session ID from candidate_session:", sessionId);
              }
            } catch (error) {
              console.error("Failed to parse candidate session:", error);
            }
          }

          if (!sessionId) {
            console.error("No valid session ID found");
            setToastMessage({
              message: "Session data not found. Please try again.",
              type: "error"
            });
            return newTime;
          }
          
          console.log("All checks passed, triggering feedback generation with session ID:", sessionId);
          disconnect();
          generateAndSaveFeedback();
        }

        if (newTime <= 1) {
          clearInterval(timer);
          localStorage.removeItem('sessionTimeLeft');
          localStorage.removeItem('sessionStartTime');
          if (!isFeedbackSaved) {
            router.push('/landing');
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    router,
    disconnect,
    hasMounted,
    isFeedbackSaved,
    generateAndSaveFeedback,
    setToastMessage
  ]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleConnect = useCallback(
    async (c: boolean, mode: ConnectionMode) => {
      console.log('handleConnect called:', { connect: c, mode });
      try {
        if (c) {
          // Get session data
          const sessionData = localStorage.getItem('candidate_session');
          if (!sessionData) {
            console.error('No session data found');
            setToastMessage({
              message: "Session data not found. Please try again.",
              type: "error"
            });
            return;
          }

          const parsedSession = JSON.parse(sessionData);
          console.log('Session data:', parsedSession);

          // Connect with the session data
          connect(mode);
          console.log('Connection initiated');
        } else {
          disconnect();
          console.log('Disconnected');
        }
      } catch (error) {
        console.error('Connection error:', error);
        setToastMessage({
          message: "Failed to connect. Please try again.",
          type: "error"
        });
      }
    },
    [connect, disconnect, setToastMessage]
  );

  const showPG = useMemo(() => {
    if (process.env.NEXT_PUBLIC_LIVEKIT_URL) {
      return true;
    }
    if(wsUrl) {
      return true;
    }
    return false;
  }, [wsUrl])

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', config.settings.theme_color);
    document.documentElement.style.setProperty('--theme-hover', `${config.settings.theme_color}1A`);
    document.documentElement.style.setProperty('--theme-border', `${config.settings.theme_color}33`);
    document.documentElement.style.setProperty('--theme-shadow', `${config.settings.theme_color}4D`);
    document.documentElement.style.setProperty('--lk-theme-color', config.settings.theme_color);
  }, [config.settings.theme_color]);

  return (
    <div className="dark-theme min-h-screen">
      <Head>
        <title>Interview Session - Mockello</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <AnimatePresence>
        {showFullscreenPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-75 bg-black"
          >
            <div className="fullscreen-prompt max-w-md w-full p-6 rounded-xl">
              <motion.h2 
                variants={fadeInUp}
                className="text-2xl font-semibold mb-4 text-center"
              >
                Ready to Start Your Interview?
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-text-secondary mb-6 text-center"
              >
                Please enter fullscreen mode to begin your interview session. This helps maintain focus and prevent distractions.
              </motion.p>
              <motion.button
                variants={fadeInUp}
                onClick={enterFullscreen}
                className="fullscreen-button w-full py-3 px-4 rounded-lg font-medium text-center"
              >
                Enter Fullscreen & Start Interview
              </motion.button>
            </div>
          </motion.div>
        )}

        {showFullscreenReturnPrompt && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-75 bg-black"
          >
            <div className="fullscreen-prompt max-w-md w-full p-6 rounded-xl">
              <motion.h2 
                variants={fadeInUp}
                className="text-2xl font-semibold mb-4 text-center text-red-500"
              >
                Fullscreen Mode Required
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-text-secondary mb-6 text-center"
              >
                You have exited fullscreen mode. Please return to fullscreen to continue your interview. This is your first warning.
              </motion.p>
              <motion.button
                variants={fadeInUp}
                onClick={enterFullscreen}
                className="fullscreen-button w-full py-3 px-4 rounded-lg font-medium text-center"
              >
                Return to Fullscreen Mode
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`${inter.className} p-4 md:p-6 playground-container min-h-screen`}>
        {!showFullscreenPrompt && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Interview Session</h1>
                <div className="timer text-xl">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </motion.div>

            {/* Keep existing LiveKitRoom and other components */}
            <motion.div variants={fadeIn} className="playground-container rounded-xl p-4 md:p-6">
              {shouldConnect && token && wsUrl ? (
                <LiveKitRoom
                  token={token}
                  serverUrl={wsUrl}
                  connect={shouldConnect}
                  onConnected={() => setRoomState(ConnectionState.Connected)}
                >
                  <RoomAudioRenderer />
                  <StartAudio label="Click to enable audio" />
                  <Playground 
                    themeColors={themeColorsArray}
                    onConnect={(connected: boolean) => {
                      console.log('Playground connect:', connected);
                      const connectionMode = process.env.NEXT_PUBLIC_LIVEKIT_URL ? "env" as ConnectionMode : mode;
                      connect(connectionMode);
                    }}
                  />
                </LiveKitRoom>
              ) : (
                <PlaygroundConnect 
                  accentColor={themeColors.primary}
                  onConnectClicked={(connectionMode: ConnectionMode) => {
                    console.log('Connect clicked:', connectionMode);
                    connect(connectionMode);
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="toast-wrapper bg-surface p-4 rounded-lg shadow-lg border border-border">
              <p className={`text-${toastMessage.type === 'error' ? 'red' : 'green'}-500`}>
                {toastMessage.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 