import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiAward, FiList, FiGift } from 'react-icons/fi';

interface Job {
  _id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyEmail: string;
  description: string;
  jobType: string;
  workLocation: string;
  workHours: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experience: {
    min: number;
    max: number;
  };
  skills: string[];
  benefits: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  hasApplied?: boolean;
  eligibilityCriteria: {
    cgpa: number;
    backlogs: number;
    branches: string[];
    graduationYear: number;
  };
  campusRecruitment: {
    driveDate: string;
    applicationDeadline: string;
    selectionProcess: string[];
    isActive: boolean;
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [mockelloId, setMockelloId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    company: '',
    branch: '',
    graduationYear: '',
  });

  useEffect(() => {
    // Clear any stored MockelloID and set loading to false
    localStorage.removeItem('mockello_id');
    setIsAuthenticated(false);
    setLoading(false);
  }, []);

  // Modify search filter effect to include additional filters
  useEffect(() => {
    if (jobs.length > 0) {
      const filtered = jobs.filter(job => {
        const matchesCompany = !filters.company || 
          job.companyName.toLowerCase().includes(filters.company.toLowerCase());
        
        const matchesBranch = !filters.branch || 
          job.eligibilityCriteria.branches.some(branch => 
            branch.toLowerCase().includes(filters.branch.toLowerCase())
          );
        
        const matchesYear = !filters.graduationYear || 
          job.eligibilityCriteria.graduationYear.toString() === filters.graduationYear;

        return matchesCompany && matchesBranch && matchesYear;
      });
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs, filters]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      console.log('Raw jobs data received:', data.jobs);

      // Add default values for missing fields
      const processedJobs = data.jobs.map((job: any) => ({
        ...job,
        campusRecruitment: job.campusRecruitment || {
          driveDate: job.createdAt || new Date().toISOString(),
          applicationDeadline: job.updatedAt || new Date().toISOString(),
          selectionProcess: job.selectionProcess || ['Interview'],
          isActive: job.status === 'active'
        },
        eligibilityCriteria: job.eligibilityCriteria || {
          cgpa: 0,
          backlogs: 0,
          branches: ['All Branches'],
          graduationYear: new Date().getFullYear()
        }
      }));

      console.log('Processed jobs:', processedJobs);
      setJobs(processedJobs);
      setFilteredJobs(processedJobs);
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/candidate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mockelloId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid MockelloID');
      }

      // Store MockelloID temporarily for the session
      localStorage.setItem('mockello_id', mockelloId);
      setIsAuthenticated(true);
      fetchJobs();
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setLoading(false);
    }
  };

  // Add a function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('mockello_id');
    setIsAuthenticated(false);
    setMockelloId('');
    setJobs([]);
    setFilteredJobs([]);
    setSelectedJob(null);
    setError(null);
  };

  // Modify the navbar to include a logout button
  const renderNavbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#BE185D]/10 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-[#9D174D]">
              Mockello
            </span>
            <span className="hidden sm:inline-block px-2 py-1 rounded-md bg-[#BE185D]/5 text-[#BE185D] text-sm font-medium">
              Jobs
            </span>
          </Link>
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                MockelloID: <span className="text-[#BE185D] font-medium">{mockelloId}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-[#BE185D] hover:bg-[#BE185D]/5 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const handleApply = async (jobId: string) => {
    try {
      // Find the job to get companyId
      const job = jobs.find(j => j._id === jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          companyId: job.companyId,
          mockelloId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply for job');
      }

      // Redirect to success page
      router.push(`/application-success?jobId=${jobId}`);
    } catch (error) {
      console.error('Error applying for job:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply for job');
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()}`;
  };

  const formatExperience = (experience: Job['experience'] | undefined): string => {
    if (!experience) return 'Not specified';
    
    if (typeof experience === 'string') return experience;
    
    if (typeof experience === 'object' && experience !== null) {
      if (experience.min === experience.max) {
        return `${experience.min} years`;
      }
      return `${experience.min} - ${experience.max} years`;
    }
    
    return 'Not specified';
  };

  // Add filter section component
  const renderFilters = () => (
    <motion.div 
      variants={fadeInUp}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <input
          type="text"
          value={filters.company}
          onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
          placeholder="Filter by company..."
          className="w-full px-4 py-2 rounded-xl border border-[#BE185D]/20 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 bg-white/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
        <input
          type="text"
          value={filters.branch}
          onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
          placeholder="Filter by branch..."
          className="w-full px-4 py-2 rounded-xl border border-[#BE185D]/20 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 bg-white/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
        <input
          type="text"
          value={filters.graduationYear}
          onChange={(e) => setFilters(prev => ({ ...prev, graduationYear: e.target.value }))}
          placeholder="Filter by year..."
          className="w-full px-4 py-2 rounded-xl border border-[#BE185D]/20 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 bg-white/50"
        />
      </div>
    </motion.div>
  );

  // Modify job card to include campus recruitment info
  const renderJobCard = (job: Job) => (
    <motion.div
      key={job._id}
      variants={fadeInUp}
      className="group bg-white rounded-2xl p-6 shadow-lg border border-[#BE185D]/5 hover:border-[#BE185D]/20 transition-all hover:shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-[#BE185D] transition-colors mb-2">
            {job.title}
          </h2>
          <div className="flex items-center space-x-2 text-[#BE185D] font-medium">
            <FiBriefcase className="w-4 h-4" />
            <span>{job.companyName}</span>
          </div>
        </div>
        {(job.campusRecruitment?.isActive ?? job.status === 'active') ? (
          <button
            onClick={() => {
              if (!job.hasApplied) {
                handleApply(job._id);
              }
            }}
            className={`flex-shrink-0 px-6 py-2.5 rounded-xl transition-all ${
              job.hasApplied
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-gradient-to-r from-[#BE185D] to-[#9D174D] text-white hover:from-[#9D174D] hover:to-[#BE185D] shadow-lg shadow-[#BE185D]/10 hover:shadow-[#BE185D]/20 transform hover:-translate-y-0.5'
            }`}
            disabled={job.hasApplied || new Date(job.campusRecruitment?.applicationDeadline ?? job.updatedAt) < new Date()}
          >
            {job.hasApplied ? 'Already Applied' : 
             new Date(job.campusRecruitment?.applicationDeadline ?? job.updatedAt) < new Date() ? 
             'Deadline Passed' : 'Apply Now'}
          </button>
        ) : (
          <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">
            Drive Inactive
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="flex items-start space-x-3">
          <FiMapPin className="w-5 h-5 text-[#BE185D] mt-1" />
          <div>
            <p className="text-gray-500 text-sm">Location</p>
            <p className="text-gray-800 font-medium">{job.workLocation}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <FiClock className="w-5 h-5 text-[#BE185D] mt-1" />
          <div>
            <p className="text-gray-500 text-sm">Drive Date</p>
            <p className="text-gray-800 font-medium">
              {new Date(job.campusRecruitment?.driveDate ?? job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <FiDollarSign className="w-5 h-5 text-[#BE185D] mt-1" />
          <div>
            <p className="text-gray-500 text-sm">Package</p>
            <p className="text-gray-800 font-medium">{formatSalary(job.salary)}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <FiAward className="w-5 h-5 text-[#BE185D] mt-1" />
          <div>
            <p className="text-gray-500 text-sm">Min. CGPA</p>
            <p className="text-gray-800 font-medium">{job.eligibilityCriteria?.cgpa ?? 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <FiList className="w-4 h-4 text-[#BE185D]" />
          <p className="text-gray-500 text-sm">Eligibility Criteria</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Branches:</span> {job.eligibilityCriteria?.branches?.join(', ') ?? 'All Branches'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Graduation Year:</span> {job.eligibilityCriteria?.graduationYear ?? new Date().getFullYear()}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Max Backlogs:</span> {job.eligibilityCriteria?.backlogs ?? 'Not specified'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <FiList className="w-4 h-4 text-[#BE185D]" />
          <p className="text-gray-500 text-sm">Selection Process</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(job.campusRecruitment?.selectionProcess ?? ['Interview']).map((step, index) => (
            <span key={index} className="px-3 py-1.5 rounded-xl bg-[#BE185D]/5 text-[#BE185D] text-sm font-medium">
              {step}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-gray-400 text-sm">
          Posted: {new Date(job.createdAt).toLocaleDateString()}
        </p>
        <p className="text-[#BE185D] text-sm font-medium">
          Apply by: {new Date(job.campusRecruitment?.applicationDeadline ?? job.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BE185D] mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading amazing opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mockello - Campus Recruitment Portal</title>
        <meta name="description" content="Apply for campus placement opportunities" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-white to-pink-50">
        {renderNavbar()}

        <main className="pt-24 container mx-auto px-6 pb-12">
          {!isAuthenticated ? (
            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-[#9D174D]">
                  Welcome to Mockello
                </h1>
                <p className="text-gray-600">Enter your MockelloID to explore opportunities</p>
              </div>
              <form onSubmit={handleAuthenticate} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-[#BE185D]/10">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">MockelloID</label>
                  <input
                    type="text"
                    value={mockelloId}
                    onChange={(e) => setMockelloId(e.target.value)}
                    placeholder="Enter your MockelloID"
                    className="w-full bg-gray-50 border border-[#BE185D]/20 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all placeholder-gray-400"
                    required
                  />
                </div>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#BE185D] to-[#9D174D] text-white rounded-xl hover:from-[#9D174D] hover:to-[#BE185D] transition-all shadow-lg shadow-[#BE185D]/20 hover:shadow-[#BE185D]/30 transform hover:-translate-y-0.5"
                >
                  Continue
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-[#9D174D] mb-2">
                    Campus Recruitment Drives
                  </h1>
                  <p className="text-gray-600">Explore and apply for placement opportunities</p>
                </div>
              </div>

              {renderFilters()}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <motion.div 
                className="grid gap-6"
                variants={staggerContainer}
              >
                {filteredJobs.map(renderJobCard)}
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Enhanced Job Details Popup */}
      {selectedJob && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#BE185D]/10"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedJob.title}</h2>
                <p className="text-[#BE185D] font-medium mt-1">{selectedJob.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 text-[#BE185D] mt-1" />
                  <div>
                    <h3 className="text-gray-500 text-sm">Work Location</h3>
                    <p className="text-gray-800 font-medium mt-1">{selectedJob.workLocation || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiClock className="w-5 h-5 text-[#BE185D] mt-1" />
                  <div>
                    <h3 className="text-gray-500 text-sm">Work Hours</h3>
                    <p className="text-gray-800 font-medium mt-1">{selectedJob.workHours || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiDollarSign className="w-5 h-5 text-[#BE185D] mt-1" />
                  <div>
                    <h3 className="text-gray-500 text-sm">Salary</h3>
                    <p className="text-gray-800 font-medium mt-1">{formatSalary(selectedJob.salary)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiAward className="w-5 h-5 text-[#BE185D] mt-1" />
                  <div>
                    <h3 className="text-gray-500 text-sm">Experience Required</h3>
                    <p className="text-gray-800 font-medium mt-1">{formatExperience(selectedJob.experience)}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FiList className="w-5 h-5 text-[#BE185D]" />
                  <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <FiAward className="w-5 h-5 text-[#BE185D]" />
                    <h3 className="text-lg font-semibold text-gray-800">Required Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-xl bg-[#BE185D]/5 text-[#BE185D] text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <FiGift className="w-5 h-5 text-[#BE185D]" />
                    <h3 className="text-lg font-semibold text-gray-800">Benefits</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    {selectedJob.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BE185D] mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (!selectedJob.hasApplied) {
                      handleApply(selectedJob._id);
                    }
                  }}
                  className={`w-full px-6 py-3 rounded-xl text-center transition-all ${
                    selectedJob.hasApplied
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-gradient-to-r from-[#BE185D] to-[#9D174D] text-white hover:from-[#9D174D] hover:to-[#BE185D] shadow-lg shadow-[#BE185D]/10 hover:shadow-[#BE185D]/20 transform hover:-translate-y-0.5'
                  }`}
                  disabled={selectedJob.hasApplied}
                >
                  {selectedJob.hasApplied ? 'Already Applied' : 'Apply for this Position'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
} 