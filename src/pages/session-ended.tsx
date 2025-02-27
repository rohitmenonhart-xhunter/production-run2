import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const SessionEndedPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Session Terminated</h1>
        <p className="text-gray-700 mb-6">
          Your session has been terminated because you exited fullscreen mode multiple times.
          This is required to maintain the integrity of the interview process.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default SessionEndedPage; 