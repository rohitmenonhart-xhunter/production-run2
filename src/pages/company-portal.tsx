import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { SparklesCore } from '@/components/ui/sparkles';
import { useState } from 'react';
import { useRouter } from 'next/router';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
};

export default function CompanyPortal() {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mockelloId, setMockelloId] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    website: '',
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setMockelloId('');
    
    if (isSigningUp) {
      try {
        // First analyze the company website
        const analysisResponse = await fetch('/api/analyze-company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ websiteUrl: formData.website }),
        });

        if (!analysisResponse.ok) {
          throw new Error('Failed to analyze company website');
        }

        const companyAnalysis = await analysisResponse.json();
        
        // Sign up the company with the analyzed data
        const signupResponse = await fetch('/api/company/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            companyData: companyAnalysis,
          }),
        });

        if (!signupResponse.ok) {
          const error = await signupResponse.json();
          throw new Error(error.error || 'Failed to create company account');
        }

        const company = await signupResponse.json();
        
        // Store email for later use
        localStorage.setItem('company_email', formData.email);
        
        // Show success message with MockelloID
        setMockelloId(company.mockelloId);
        setSuccessMessage('Account created successfully! Please save your MockelloID.');
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push({
            pathname: '/company-dashboard',
            query: { data: JSON.stringify(companyAnalysis) },
          });
        }, 5000); // 5 second delay to show the MockelloID
      } catch (error) {
        console.error('Error during signup:', error);
        setIsLoading(false);
        setError(error instanceof Error ? error.message : 'An error occurred during signup');
      }
    } else {
      try {
        const response = await fetch('/api/company/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid credentials');
        }

        const { company } = data;
        
        // Store email for later use
        localStorage.setItem('company_email', formData.email);
        
        // Show MockelloID if available
        if (company.mockelloId) {
          setMockelloId(company.mockelloId);
          setSuccessMessage('Signed in successfully!');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Brief delay to show the message
        }
        
        // Redirect to dashboard
        router.push({
          pathname: '/company-dashboard',
          query: { data: JSON.stringify(company.companyData) },
        });
      } catch (error) {
        console.error('Error during signin:', error);
        setIsLoading(false);
        setError(error instanceof Error ? error.message : 'Invalid email or password');
      }
    }
  };

  return (
    <>
      <Head>
        <title>Mockello - Company Portal</title>
        <meta name="description" content="Join Mockello to revolutionize your campus recruitment process with AI-powered candidate evaluation" />
      </Head>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-black/80 rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#BE185D] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-medium">
              {isSigningUp ? 'Analyzing your company...' : 'Signing you in...'}
            </p>
          </div>
        </div>
      )}

      <main className="bg-black min-h-screen text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#BE185D_0%,_transparent_25%)] opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#BE185D_0%,_transparent_25%)] opacity-10 animate-pulse delay-75"></div>
          <div className="absolute inset-0 bg-black bg-opacity-90"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#BE185D1A_1px,transparent_1px),linear-gradient(to_bottom,#BE185D1A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-[#BE185D]/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">Mockello</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
                <button 
                  onClick={() => setIsSigningUp(!isSigningUp)}
                  className="px-4 py-2 rounded-full border border-[#BE185D] text-[#BE185D] hover:bg-[#BE185D] hover:text-white transition-all"
                >
                  {isSigningUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
            {/* Left side - Hero Content */}
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="flex-1 text-center lg:text-left"
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">
                Transform Your Campus Recruitment
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Leverage AI to streamline your hiring process, reduce costs, and find the best talent from campus placements.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3">
                  <span className="text-[#BE185D]">✓</span>
                  <span>90% Time Savings</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3">
                  <span className="text-[#BE185D]">✓</span>
                  <span>AI-Powered Evaluation</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3">
                  <span className="text-[#BE185D]">✓</span>
                  <span>Personalized Dashboard</span>
                </div>
              </div>
            </motion.div>

            {/* Right side - Auth Form */}
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="flex-1 w-full max-w-md"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-[#BE185D]/20">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {isSigningUp ? 'Create Company Account' : 'Welcome Back'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  {successMessage && mockelloId && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg">
                      <p className="text-sm mb-2">{successMessage}</p>
                      <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded">
                        <code className="font-mono text-lg">{mockelloId}</code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(mockelloId)}
                          className="text-xs px-2 py-1 rounded border border-green-500/50 hover:bg-green-500/20 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                  {isSigningUp && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all"
                      required
                    />
                  </div>
                  {isSigningUp && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg bg-black/50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all"
                        required
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {isSigningUp ? 'Create Account' : 'Sign In'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
} 