import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Alert } from '@mui/material';

export default function HRLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/hr/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      // Ensure all required fields are present
      const hrData = {
        _id: data.hr._id,
        username: data.hr.username,
        companyName: data.hr.companyName || data.hr.company, // handle both possible field names
        uniqueId: data.hr.uniqueId // Store the uniqueId
      };

      // Debug log
      console.log('Storing HR data:', hrData);

      localStorage.setItem('hr_data', JSON.stringify(hrData));
      router.push('/hr-dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>HR Login - Mockello</title>
        <meta name="description" content="HR login portal for Mockello" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#BE185D_0.8px,transparent_0.8px)] [background-size:16px_16px]"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to <span className="text-[#BE185D]">Mockello</span>
              </h1>
              <p className="mt-2 text-gray-600">Sign in to your HR dashboard</p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#BE185D]/20 focus:border-[#BE185D] transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#BE185D]/20 focus:border-[#BE185D] transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: '12px',
                      bgcolor: 'rgba(211, 47, 47, 0.05)', 
                      color: '#d32f2f',
                      border: '1px solid rgba(211, 47, 47, 0.1)',
                      '& .MuiAlert-icon': { color: '#d32f2f' }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-[#BE185D] text-white rounded-xl hover:bg-[#9D174D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#BE185D]/10"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Need help? Contact your company administrator
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
} 