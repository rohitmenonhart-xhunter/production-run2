import React, { useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/utils/firebase';

interface SessionData {
  sessionId: string;
  mockelloId?: string;
  candidateName?: string;
  candidateEmail?: string;
  batchId?: string;
  createdAt?: string;
  hrId?: string;
  [key: string]: any;  // Allow for additional properties
}

interface RegistrationFormProps {
  onSubmit: (data: { sessionId: string }) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [sessionId, setSessionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!sessionId.trim()) {
      setError('Please enter your Session ID');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Validating session ID:', sessionId);
      
      // Get the specific session directly
      const sessionRef = ref(database, `sessions/${sessionId}`);
      const snapshot = await get(sessionRef);
      
      if (!snapshot.exists()) {
        console.warn('No session found with ID:', sessionId);
        setError('Invalid session ID. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      const sessionData = snapshot.val();
      console.log('Found session data:', sessionData);

      // Validate session data
      if (!sessionData.candidateEmail || !sessionData.candidateName || !sessionData.mockelloId) {
        console.warn('Invalid session data structure:', sessionData);
        setError('Invalid session structure. Please contact support.');
        setIsSubmitting(false);
        return;
      }

      // Store session data in localStorage
      localStorage.setItem('candidate_session', JSON.stringify({
        ...sessionData,
        verifiedAt: new Date().toISOString()
      }));
      
      // Call onSubmit with the session ID
      onSubmit({ sessionId });
        
    } catch (error) {
      console.error('Session verification error:', error);
      setError('An error occurred while verifying the session.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-[#BE185D]/20 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">
          Welcome to HR Interview
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="sessionId" className="block text-sm font-medium text-gray-300 mb-2">
              Session ID
            </label>
            <input
              type="text"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-[#BE185D]/20 rounded-lg focus:outline-none focus:border-[#BE185D] transition-colors text-white"
              required
              placeholder="Enter your session ID"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80 text-white rounded-lg hover:shadow-[0_0_30px_-5px_#BE185D] transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
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
      </div>
    </div>
  );
}; 