import { useState, useEffect } from 'react';
import { getDatabase, ref, set, push, remove, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

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

interface AuthKey {
  id: string;
  value: string;
  active: boolean;
  createdAt: string;
  description: string;
  validityDays: number;
  interviewLimit: number;  // -1 for no limit
  studentsPerInterview: number;  // -1 for no limit
  usedInterviews: number;
}

interface Company {
  _id: string;
  mockelloId?: string;  // Added mockelloId field
  name: string;
  email: string;
  billingData?: {
    totalSessions: number;
    totalMaxSessions: number;
    totalCost: number;
    costPerSession: number;
    credits: number;  // Total credits purchased
    creditsUsed: number;  // Credits used by HR sessions
  };
  hrCount: number;
  lastUpdated?: string;
}

export default function AdminDashboard() {
  const [keys, setKeys] = useState<AuthKey[]>([]);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [interviewLimit, setInterviewLimit] = useState(-1);
  const [studentsPerInterview, setStudentsPerInterview] = useState(4);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [newSessionLimit, setNewSessionLimit] = useState<number>(0);
  const [newCredits, setNewCredits] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [newCreditsUsed, setNewCreditsUsed] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      // Listen for changes in auth keys
      const keysRef = ref(database, 'hr_auth_keys');
      const unsubscribe = onValue(keysRef, (snapshot) => {
        if (snapshot.exists()) {
          const keyData = snapshot.val();
          const keyList = Object.entries(keyData).map(([id, data]: [string, any]) => ({
            id,
            value: data.value, // Use the stored full key
            active: data.active,
            createdAt: data.createdAt,
            description: data.description,
            validityDays: data.validityDays,
            interviewLimit: data.interviewLimit || -1,
            studentsPerInterview: data.studentsPerInterview || 4,
            usedInterviews: data.usedInterviews || 0
          }));
          setKeys(keyList);
        } else {
          setKeys([]);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchCompanies();
    }
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'Iamunique7$') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin key');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        localStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        fetchCompanies();
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      toast.error('Failed to authenticate');
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/companies');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch companies');
      }
      const data = await response.json();
      setCompanies(data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Authentication - Mockello</title>
          <meta name="description" content="Admin authentication" />
        </Head>

        <main className="bg-black min-h-screen text-white">
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#BE185D_0%,_transparent_25%)] opacity-20 animate-pulse"></div>
            <div className="absolute inset-0 bg-black bg-opacity-90"></div>
          </div>

          <div className="relative container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">
                Admin Authentication
              </h1>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="bg-black/30 p-6 rounded-xl border border-[#BE185D]/20">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="adminKey" className="block text-gray-300 mb-2">Admin Key</label>
                      <input
                        type="password"
                        id="adminKey"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-[#BE185D]/20 rounded-lg focus:outline-none focus:border-[#BE185D] transition-colors text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80 text-white rounded-full hover:shadow-[0_0_30px_-5px_#BE185D] transition-all duration-300"
                >
                  Access Admin Dashboard
                </button>
              </form>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    // Generate validation ID (first 8 chars)
    let validationId = '';
    for (let i = 0; i < 8; i++) {
      validationId += chars[Math.floor(Math.random() * chars.length)];
    }

    // Encode interview limit (2 chars)
    // -1 = unlimited (99), 0-98 = actual limit
    const encodedInterviewLimit = (interviewLimit === -1 ? 99 : Math.min(interviewLimit, 98))
      .toString()
      .padStart(2, '0');

    // Encode students per interview limit (2 chars)
    // -1 = unlimited (99), 0-98 = actual limit
    const encodedStudentLimit = (studentsPerInterview === -1 ? 99 : Math.min(studentsPerInterview, 98))
      .toString()
      .padStart(2, '0');

    // Generate random chars for the rest (4 chars)
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }

    // Combine all parts with dashes for readability
    return `${validationId}-${encodedInterviewLimit}${encodedStudentLimit}-${randomPart}`;
  };

  const createNewKey = async () => {
    if (!newKeyDescription.trim()) {
      alert('Please enter a description for the key');
      return;
    }

    try {
      const keysRef = ref(database, 'hr_auth_keys');
      const newKeyRef = push(keysRef);
      const generatedKey = generateKey();
      const validationId = generatedKey.split('-')[0];
      
      // Store validation info and the full key in Firebase
      await set(newKeyRef, {
        validationId: validationId,
        value: generatedKey, // Store the full key
        active: true,
        createdAt: new Date().toISOString(),
        description: newKeyDescription.trim(),
        validityDays: validityDays,
        interviewLimit: interviewLimit,
        studentsPerInterview: studentsPerInterview,
        usedInterviews: 0
      });

      // Don't update local state, let the Firebase listener handle it
      setNewKeyDescription('');
      setValidityDays(30);
      setInterviewLimit(-1);
      setStudentsPerInterview(4);
    } catch (error) {
      console.error('Error creating key:', error);
      alert('Failed to create key. Please try again.');
    }
  };

  const toggleKeyStatus = async (key: AuthKey) => {
    try {
      const keyRef = ref(database, `hr_auth_keys/${key.id}`);
      await set(keyRef, {
        validationId: key.value.split('-')[0],
        value: key.value, // Keep the full key
        active: !key.active,
        createdAt: key.createdAt,
        description: key.description,
        validityDays: key.validityDays,
        interviewLimit: key.interviewLimit,
        studentsPerInterview: key.studentsPerInterview,
        usedInterviews: key.usedInterviews || 0
      });
    } catch (error) {
      console.error('Error toggling key status:', error);
      alert('Failed to update key status. Please try again.');
    }
  };

  const deleteKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this key? This action cannot be undone.')) {
      try {
        const keyRef = ref(database, `hr_auth_keys/${keyId}`);
        await remove(keyRef);
      } catch (error) {
        console.error('Error deleting key:', error);
        alert('Failed to delete key. Please try again.');
      }
    }
  };

  const handleUpdateSessionLimit = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/update-session-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          newLimit: newSessionLimit,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update session limit');
      }
      
      const data = await response.json();
      toast.success(`Session limit updated successfully. Each HR now has ${data.limitPerHR} sessions.`);
      
      // Immediately fetch updated data
      await fetchCompanies();
      
      // Reset selection state
      setSelectedCompany(null);
      setNewSessionLimit(0);
    } catch (error) {
      console.error('Error updating session limit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update session limit');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSessions = async (companyId: string) => {
    if (!confirm('Are you sure you want to reset all sessions and credits used for this company? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/reset-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset sessions and credits');
      }
      
      const data = await response.json();
      toast.success(`Successfully reset sessions and credits used for ${data.hrsUpdated} HR(s)`);
      
      // Immediately fetch updated data
      await fetchCompanies();
    } catch (error) {
      console.error('Error resetting sessions and credits:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset sessions and credits');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredits = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/update-company-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, credits: newCredits }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update credits');
      }
      
      toast.success('Credits updated successfully');
      setSelectedCompany(null);
      
      // Refresh companies data
      await fetchCompanies();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update credits');
    } finally {
      setLoading(false);
    }
  };

  const handleResetCredits = async (companyId: string) => {
    if (!confirm('Are you sure you want to reset credits used for this company? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/reset-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset credits');
      }
      
      toast.success('Credits used reset successfully');
      
      // Refresh companies data
      await fetchCompanies();
    } catch (error) {
      console.error('Error resetting credits:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset credits');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreditsUsed = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/update-credits-used', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, creditsUsed: newCreditsUsed }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update credits used');
      }
      
      toast.success('Credits used updated successfully');
      setSelectedCompany(null);
      
      // Refresh companies data
      await fetchCompanies();
    } catch (error) {
      console.error('Error updating credits used:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update credits used');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mockello Admin Dashboard</title>
        <meta name="description" content="Admin dashboard for managing companies" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-lg border-b border-pink-500/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-300">
                Mockello Admin
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_auth');
                  setIsAuthenticated(false);
                }}
                className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Company Management</h1>
            
            {/* Companies Table */}
            <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mockello ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">HR Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sessions Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Session Limit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {companies.map((company) => (
                      <tr key={company._id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{company.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{company.mockelloId || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{company.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{company.hrCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {company.billingData?.credits || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {company.billingData?.creditsUsed || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {company.billingData?.totalSessions || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {company.billingData?.totalMaxSessions || company.hrCount * 10}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {selectedCompany === company._id ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={newSessionLimit}
                                    onChange={(e) => setNewSessionLimit(parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 rounded bg-gray-800 border border-gray-700"
                                    min="0"
                                    placeholder="Sessions"
                                  />
                                  <button
                                    onClick={() => handleUpdateSessionLimit(company._id)}
                                    className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                                  >
                                    Update Sessions
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={newCredits}
                                    onChange={(e) => setNewCredits(parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 rounded bg-gray-800 border border-gray-700"
                                    min="0"
                                    placeholder="Credits"
                                  />
                                  <button
                                    onClick={() => handleUpdateCredits(company._id)}
                                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                  >
                                    Update Credits
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={newCreditsUsed}
                                    onChange={(e) => setNewCreditsUsed(parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 rounded bg-gray-800 border border-gray-700"
                                    min="0"
                                    placeholder="Used"
                                  />
                                  <button
                                    onClick={() => handleUpdateCreditsUsed(company._id)}
                                    className="px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                                  >
                                    Update Used
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedCompany(null)}
                                className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCompany(company._id);
                                  setNewSessionLimit(company.billingData?.totalMaxSessions || company.hrCount * 10);
                                  setNewCredits(company.billingData?.credits || 0);
                                  setNewCreditsUsed(company.billingData?.creditsUsed || 0);
                                }}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleResetSessions(company._id)}
                                className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                              >
                                Reset All
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 