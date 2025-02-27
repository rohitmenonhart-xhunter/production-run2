import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HRManagementTab from '../components/HRManagementTab';
import { FiBriefcase, FiUsers, FiPieChart, FiSettings, FiGrid } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
};

interface CompanyInfo {
  name: string;
  logo: string;
  description: string;
  industry: string;
  specialties: string[];
  products: string[];
  founders: string[];
  mainServices: string[];
  technologies: string[];
  businessModel: string;
  targetMarket: string;
  competitiveAdvantages: string[];
  mainOfferings: string[];
  website: string;
  mockelloId?: string;
  billingData?: {
    totalSessions: number;
    totalMaxSessions: number;
    credits: number;
    creditsUsed: number;
  };
}

interface Job {
  _id: string;
  title: string;
  description: string;
  companyEmail: string;
  companyName: string;
  mockelloId: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  } | string;
  workLocation: string;
  workHours: string;
  jobType: string;
  experience: string | {
    min: number;
    max: number;
  };
  skills: string[] | string;
  benefits: string[] | string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface NewJob {
  title: string;
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
  campusRecruitment: {
    driveDate: string;
    applicationDeadline: string;
    selectionProcess: string[];
    isActive: boolean;
  };
  eligibilityCriteria: {
    cgpa: number;
    backlogs: number;
    branches: string[];
    graduationYear: number;
  };
}

interface Application {
  _id: string;
  jobId: string;
  candidateMockelloId: string;
  candidateId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobTitle: string;
  companyId: string;
  companyEmail: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateResume: string;
  candidateSkills: string[];
  candidateExperience: string;
  candidateEducation?: { degree: string; institution: string; year: string }[];
  candidateProjects?: { name: string; description: string; technologies?: string[] }[];
  candidateAchievements?: string[];
}

// Add or update the interface definition at the top of the file
interface ATSCandidate {
  candidateId: string;
  name: string;
  appliedRole: string;
  recommendedRoles: string[];
  matchPercentage: number;
  justification: string;
  matchingSkills: string[];
  missingSkills: string[];
}

interface ATSData {
  allowed: ATSCandidate[];
  notAllowed: ATSCandidate[];
  mediumMatch?: ATSCandidate[];
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [companyEmail, setCompanyEmail] = useState<string>('');
  const [isEmailLoaded, setIsEmailLoaded] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Loading...',
    logo: '/placeholder-logo.png',
    description: '',
    industry: '',
    specialties: [],
    products: [],
    founders: [],
    mainServices: [],
    technologies: [],
    businessModel: '',
    targetMarket: '',
    competitiveAdvantages: [],
    mainOfferings: [],
    website: ''
  });
  const [editedInfo, setEditedInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobError, setJobError] = useState<string | null>(null);
  const [showJobPopup, setShowJobPopup] = useState(false);
  const [newJob, setNewJob] = useState<NewJob>({
    title: '',
    description: '',
    jobType: '',
    workLocation: '',
    workHours: '',
    salary: {
      min: 0,
      max: 0,
      currency: '₹'
    },
    experience: {
      min: 0,
      max: 0
    },
    skills: [],
    benefits: [],
    campusRecruitment: {
      driveDate: new Date().toISOString().split('T')[0],
      applicationDeadline: new Date().toISOString().split('T')[0],
      selectionProcess: ['Interview'],
      isActive: true
    },
    eligibilityCriteria: {
      cgpa: 0,
      backlogs: 0,
      branches: [],
      graduationYear: new Date().getFullYear()
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [selectionStep, setSelectionStep] = useState('');
  const [branch, setBranch] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [processInput, setProcessInput] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [hrs, setHRs] = useState<any[]>([]);
  const [atsData, setAtsData] = useState<ATSData>({
    allowed: [],
    notAllowed: []
  });
  const [isLoadingATS, setIsLoadingATS] = useState(false);
  const [filterPercentage, setFilterPercentage] = useState(70);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check for company email
    const email = typeof window !== 'undefined' ? localStorage.getItem('company_email') : null;
    
    if (!email) {
      // Redirect to login if no email found
      router.push('/login?redirect=/company-dashboard');
      return;
    }
    
    setCompanyEmail(email);
    setIsEmailLoaded(true);
  }, [router]);

  useEffect(() => {
    // Get analyzed data from URL query
    const data = router.query.data;
    if (data && typeof data === 'string') {
      try {
        const analyzedData = JSON.parse(data);
        setCompanyInfo(prevInfo => ({
          ...prevInfo,
          name: analyzedData.name,
          logo: analyzedData.logo || '/placeholder-logo.png',
          description: analyzedData.description,
          industry: analyzedData.industry,
          specialties: analyzedData.specialties,
          products: analyzedData.products || [],
          founders: analyzedData.founders || [],
          mainServices: analyzedData.mainServices || [],
          technologies: analyzedData.technologies || [],
          businessModel: analyzedData.businessModel || '',
          targetMarket: analyzedData.targetMarket || '',
          competitiveAdvantages: analyzedData.competitiveAdvantages || [],
          mainOfferings: analyzedData.mainOfferings || [],
          website: analyzedData.website || '',
          mockelloId: analyzedData.mockelloId
        }));
        setBrandColors(analyzedData.brandColors || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing company data:', error);
        setIsLoading(false);
      }
    }
  }, [router.query.data]);

  useEffect(() => {
    if (isEmailLoaded) {
      fetchJobs();
    }
  }, [isEmailLoaded]);

  useEffect(() => {
    if (companyEmail) {
      fetchHRs();
    }
  }, [companyEmail]);

  useEffect(() => {
    if (activeTab === 'ats' && companyEmail) {
      fetchATSData();
    }
  }, [activeTab, companyEmail]);

  const fetchJobs = async () => {
    if (!isEmailLoaded) return;
    
    try {
      if (!companyEmail) {
        setJobError('Company email not found. Please sign in again.');
        router.push('/login?redirect=/company-dashboard');
        return;
      }

      const response = await fetch(`/api/jobs?email=${companyEmail}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data.jobs);
      setJobError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobError('Failed to load jobs');
    }
  };

  const fetchApplications = async () => {
    if (!isEmailLoaded || !companyEmail) return;
    
    try {
      setApplicationsLoading(true);
      setApplicationsError(null);

      const response = await fetch(`/api/applications/company?companyEmail=${encodeURIComponent(companyEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationsError('Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (isEmailLoaded && activeTab === 'candidates') {
      fetchApplications();
    }
  }, [isEmailLoaded, activeTab]);

  const fetchHRs = async () => {
    if (!companyEmail) return;
    
    try {
      const response = await fetch(`/api/company/hrs?email=${encodeURIComponent(companyEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch HRs');
      const data = await response.json();
      setHRs(data.hrs);
    } catch (error) {
      console.error('Error fetching HRs:', error);
      setToastMessage({
        type: 'error',
        message: 'Failed to fetch HR list'
      });
    }
  };

  const fetchATSData = async () => {
    if (!companyEmail) return;
    
    try {
      setIsLoadingATS(true);
      const response = await fetch(`/api/company/ats?email=${encodeURIComponent(companyEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch ATS data');
      const data = await response.json();
      setAtsData(data);
    } catch (error) {
      console.error('Error fetching ATS data:', error);
      setToastMessage({
        type: 'error',
        message: 'Failed to fetch ATS data'
      });
    } finally {
      setIsLoadingATS(false);
    }
  };

  const fetchCompanyData = async () => {
    if (!companyEmail) return;
    
    try {
      const response = await fetch(`/api/company/info?email=${encodeURIComponent(companyEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch company data');
      
      const data = await response.json();
      setCompanyInfo(prevInfo => ({
        ...prevInfo,
        ...data.company,
        billingData: {
          credits: data.company.billingData?.credits || 0,
          creditsUsed: data.company.billingData?.creditsUsed || 0,
          totalSessions: data.company.billingData?.totalSessions || 0,
          totalMaxSessions: data.company.billingData?.totalMaxSessions || 0
        }
      }));
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast.error('Failed to fetch company information');
    }
  };

  useEffect(() => {
    if (isEmailLoaded && companyEmail) {
      fetchCompanyData();
    }
  }, [isEmailLoaded, companyEmail]);

  // Function to get contrasting text color
  const getContrastColor = (bgColor: string) => {
    // Simple logic to determine if text should be white or black
    const rgb = bgColor.match(/\d+/g);
    if (rgb) {
      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      return brightness > 128 ? '#000000' : '#FFFFFF';
    }
    return '#FFFFFF';
  };

  const handleEdit = () => {
    setEditedInfo(companyInfo);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!isEmailLoaded) return;
    
    try {
      if (!editedInfo) return;
      
      if (!companyEmail) {
        router.push('/login?redirect=/company-dashboard');
        throw new Error('Company email not found. Please sign in again.');
      }

      // Show loading state
      setIsLoading(true);

      const response = await fetch('/api/company/update-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: companyEmail,
          companyData: editedInfo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update company information');
      }

      // Update local state with the edited info
      setCompanyInfo(editedInfo);
      setIsEditing(false);
      setEditedInfo(null);

      // Show success message
      toast.success('Company information updated successfully');
    } catch (error) {
      console.error('Error saving company info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update company information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(null);
  };

  const handleInputChange = (field: keyof CompanyInfo, value: any) => {
    if (!editedInfo) return;
    setEditedInfo({
      ...editedInfo,
      [field]: value,
    });
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newJob,
          companyEmail: companyEmail,
          status: 'active'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post job');
      }

      // Reset form and close popup
      setNewJob({
        title: '',
        description: '',
        jobType: '',
        workLocation: '',
        workHours: '',
        salary: {
          min: 0,
          max: 0,
          currency: '₹'
        },
        experience: {
          min: 0,
          max: 0
        },
        skills: [],
        benefits: [],
        campusRecruitment: {
          driveDate: new Date().toISOString().split('T')[0],
          applicationDeadline: new Date().toISOString().split('T')[0],
          selectionProcess: ['Interview'],
          isActive: true
        },
        eligibilityCriteria: {
          cgpa: 0,
          backlogs: 0,
          branches: [],
          graduationYear: new Date().getFullYear()
        }
      });
      setShowJobPopup(false);
      fetchJobs();
    } catch (error) {
      console.error('Error posting job:', error);
      setJobError(error instanceof Error ? error.message : 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSalary = (salary: Job['salary'] | undefined): string => {
    if (!salary) return 'Salary not specified';
    
    if (typeof salary === 'string') return salary;
    
    const { min, max, currency = '₹' } = salary;
    
    // Format numbers with commas for Indian numbering system
    const formatNumber = (num: number) => {
      return num.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        useGrouping: true
      });
    };
    
    if (min === max) {
      return `${currency}${formatNumber(min)}`;
    } else if (min && max) {
      return `${currency}${formatNumber(min)} - ${currency}${formatNumber(max)}`;
    } else if (min) {
      return `${currency}${formatNumber(min)}+`;
    } else if (max) {
      return `Up to ${currency}${formatNumber(max)}`;
    }
    
    return 'Salary not specified';
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      setIsUpdating(true);

      // Parse experience string into object
      let experienceObject = { min: 0, max: 0 };
      if (typeof editingJob.experience === 'string') {
        const expStr = editingJob.experience.trim();
        if (expStr.includes('-')) {
          // Range format: "2 - 5"
          const [minStr, maxStr] = expStr.split('-').map(s => s.trim());
          const min = parseInt(minStr);
          const max = parseInt(maxStr);
          if (!isNaN(min) && !isNaN(max)) {
            experienceObject = { min, max };
          }
        } else {
          // Single value format: "2"
          const value = parseInt(expStr);
          if (!isNaN(value)) {
            experienceObject = { min: value, max: value };
          }
        }
      } else if (typeof editingJob.experience === 'object' && editingJob.experience !== null) {
        experienceObject = editingJob.experience;
      }

      // Parse salary string into object
      let salaryObject = { min: 0, max: 0, currency: '₹' };
      if (typeof editingJob.salary === 'string') {
        const salaryStr = editingJob.salary.trim();
        // Remove all currency symbols and whitespace
        const cleanSalaryStr = salaryStr.replace(/[₹$€£\s]/g, '');
        
        if (cleanSalaryStr.includes('-')) {
          // Range format: "50000-100000"
          const [minStr, maxStr] = cleanSalaryStr.split('-');
          const min = parseInt(minStr.replace(/,/g, ''));
          const max = parseInt(maxStr.replace(/,/g, ''));
          
          if (!isNaN(min) && !isNaN(max)) {
            salaryObject = { min, max, currency: '₹' };
          }
        } else {
          // Single value format: "50000"
          const value = parseInt(cleanSalaryStr.replace(/,/g, ''));
          if (!isNaN(value)) {
            salaryObject = { min: value, max: value, currency: '₹' };
          }
        }
      } else if (typeof editingJob.salary === 'object' && editingJob.salary !== null) {
        salaryObject = editingJob.salary;
      }

      const response = await fetch(`/api/jobs/${editingJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingJob,
          salary: salaryObject,
          experience: experienceObject,
          skills: typeof editingJob.skills === 'string' ? 
            editingJob.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean) : 
            editingJob.skills,
          benefits: typeof editingJob.benefits === 'string' ? 
            editingJob.benefits.split(',').map((benefit: string) => benefit.trim()).filter(Boolean) : 
            editingJob.benefits,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update job');
      }

      // Refresh jobs list
      await fetchJobs();
      setEditingJob(null);
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update job');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      setIsDeletingJob(true);
      setJobToDelete(jobId);

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete job');
      }

      // Remove the job from local state
      setJobs(jobs.filter(job => job._id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete job');
    } finally {
      setIsDeletingJob(false);
      setJobToDelete(null);
    }
  };

  const handleResetCandidatePool = async () => {
    if (!companyEmail) return;

    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to reset the candidate pool? This will delete all applications and cannot be undone.');
    if (!confirmed) return;

    try {
      setIsResetting(true);
      const response = await fetch(`/api/applications/reset?companyEmail=${encodeURIComponent(companyEmail)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset candidate pool');
      }

      // Clear local applications state
      setApplications([]);
      toast.success('Candidate pool has been reset successfully');
    } catch (error) {
      console.error('Error resetting candidate pool:', error);
      toast.error('Failed to reset candidate pool');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    if (value.endsWith(',')) {
      const skill = value.slice(0, -1).trim();
      if (skill) {
        setNewJob(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
        setSkillInput('');
      }
    }
  };

  const handleBenefitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBenefitInput(value);
    if (value.endsWith(',')) {
      const benefit = value.slice(0, -1).trim();
      if (benefit) {
        setNewJob(prev => ({
          ...prev,
          benefits: [...prev.benefits, benefit]
        }));
        setBenefitInput('');
      }
    }
  };

  const handleProcessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProcessInput(value);
    if (value.endsWith(',')) {
      const process = value.slice(0, -1).trim();
      if (process) {
        setNewJob(prev => ({
          ...prev,
          campusRecruitment: {
            ...prev.campusRecruitment,
            selectionProcess: [...prev.campusRecruitment.selectionProcess, process]
          }
        }));
        setProcessInput('');
      }
    }
  };

  const removeSkill = (index: number) => {
    setNewJob(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const removeBenefit = (index: number) => {
    setNewJob(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const removeProcess = (index: number) => {
    setNewJob(prev => ({
      ...prev,
      campusRecruitment: {
        ...prev.campusRecruitment,
        selectionProcess: prev.campusRecruitment.selectionProcess.filter((_, i) => i !== index)
      }
    }));
  };

  const handleFilterDelete = async () => {
    if (!confirm(`Are you sure you want to delete all candidates below ${filterPercentage}% match? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/company/delete-filtered-candidates?email=${encodeURIComponent(companyEmail)}&percentage=${filterPercentage}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete candidates');
      }

      const data = await response.json();
      toast.success(data.message);
      
      // Refresh the ATS data and applications list
      await fetchATSData();
      await fetchApplications();
    } catch (error) {
      console.error('Error deleting candidates:', error);
      toast.error('Failed to delete candidates');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add early return if email is not loaded
  if (!isEmailLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white bg-opacity-98">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BE185D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{companyInfo.name} - Mockello Dashboard</title>
        <meta name="description" content="Manage your campus recruitment process with Mockello" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      <div className="min-h-screen bg-white bg-opacity-98 text-gray-800">
        {/* Enhanced Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#BE185D]/10 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-gray-800">
                  Mockello
                </span>
              </Link>
                {!isLoading && (
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="h-6 w-px bg-[#BE185D]/20"></div>
                    <div className="flex items-center space-x-3">
                      {companyInfo.logo && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#BE185D]/20 flex items-center justify-center bg-white">
                          <Image
                            src={companyInfo.logo}
                            alt={companyInfo.name}
                            width={32}
                            height={32}
                            className="object-contain w-6 h-6"
                          />
                        </div>
                      )}
                      <span className="font-medium text-lg text-gray-800">{companyInfo.name}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-[#BE185D]/5 border border-[#BE185D]/20">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Credits:</span>
                      <span className="text-sm font-semibold text-[#BE185D]">{companyInfo.billingData?.credits || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Used:</span>
                      <span className="text-sm font-semibold text-[#BE185D]">{companyInfo.billingData?.creditsUsed || 0}</span>
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm rounded-lg border border-[#BE185D]/50 text-[#BE185D] hover:bg-[#BE185D]/5 transition-colors">
                  Settings
                </button>
                <button className="px-3 py-1.5 text-sm rounded-lg bg-[#BE185D] text-white hover:bg-[#BE185D]/90 transition-colors">
                  Profile
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex min-h-screen pt-20">
          {/* Enhanced Sidebar */}
          <div className="w-64 fixed left-0 h-full bg-white/80 backdrop-blur-xl border-r border-[#BE185D]/10 p-6 shadow-sm">
            <div className="space-y-2">
                    <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-[#BE185D] text-white shadow-lg shadow-[#BE185D]/20' 
                    : 'text-gray-600 hover:bg-[#BE185D]/5 hover:text-[#BE185D]'
                }`}
              >
                <FiGrid className="w-5 h-5" />
                <span>Company Overview</span>
                    </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'jobs' 
                    ? 'bg-[#BE185D] text-white shadow-lg shadow-[#BE185D]/20' 
                    : 'text-gray-600 hover:bg-[#BE185D]/5 hover:text-[#BE185D]'
                }`}
              >
                <FiBriefcase className="w-5 h-5" />
                <span>Job Listings</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'candidates' 
                    ? 'bg-[#BE185D] text-white shadow-lg shadow-[#BE185D]/20' 
                    : 'text-gray-600 hover:bg-[#BE185D]/5 hover:text-[#BE185D]'
                }`}
              >
                <FiUsers className="w-5 h-5" />
                <span>Candidate Pool</span>
              </button>
              <button
                onClick={() => setActiveTab('hr')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'hr' 
                    ? 'bg-[#BE185D] text-white shadow-lg shadow-[#BE185D]/20' 
                    : 'text-gray-600 hover:bg-[#BE185D]/5 hover:text-[#BE185D]'
                }`}
              >
                <FiSettings className="w-5 h-5" />
                <span>HR Management</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-[#BE185D] text-white shadow-lg shadow-[#BE185D]/20' 
                    : 'text-gray-600 hover:bg-[#BE185D]/5 hover:text-[#BE185D]'
                }`}
              >
                <FiPieChart className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('ats')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'ats' 
                    ? 'bg-[#BE185D] text-white shadow-lg shadow-[#BE185D]/20' 
                    : 'text-gray-600 hover:bg-[#BE185D]/5 hover:text-[#BE185D]'
                }`}
              >
                <FiUsers className="w-5 h-5" />
                <span>ATS</span>
              </button>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="flex-1 ml-64">
            <main className="container mx-auto px-6 py-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-[#BE185D]">
                      Company Overview
                    </h2>
                    <div className="flex gap-4">
                      {isEditing ? (
                        <>
                    <button
                      onClick={handleCancel}
                            className="px-4 py-2 rounded-lg border border-[#BE185D]/50 text-[#BE185D] hover:bg-[#BE185D]/5 transition-all"
                    >
                      Cancel
                    </button>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-[#BE185D] text-white hover:bg-[#BE185D]/90 transition-all"
                          >
                            Save Changes
                          </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                          className="px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] border border-[#BE185D]/20 hover:bg-[#BE185D]/10 transition-all"
                  >
                          Edit Profile
                  </button>
                )}
              </div>
            </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Company Profile Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10 hover:border-[#BE185D]/30 transition-all">
                      <div className="flex items-start space-x-6 mb-6">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#BE185D]/20 flex items-center justify-center bg-white">
                    <Image
                            src={isEditing ? editedInfo?.logo || companyInfo.logo : companyInfo.logo}
                      alt={companyInfo.name}
                            width={96}
                            height={96}
                            className="object-contain w-20 h-20"
                          />
                </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-4">
                <div>
                                <label className="block text-gray-600 text-sm mb-1">Company Name</label>
                                <input
                                  type="text"
                                  value={editedInfo?.name}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                                />
                    </div>
                              <div>
                                <label className="block text-gray-600 text-sm mb-1">Industry</label>
                                <input
                                  type="text"
                                  value={editedInfo?.industry}
                                  onChange={(e) => handleInputChange('industry', e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                                />
                </div>
                              <div>
                                <label className="block text-gray-600 text-sm mb-1">Specialties (comma-separated)</label>
                                <input
                                  type="text"
                                  value={editedInfo?.specialties.join(', ')}
                                  onChange={(e) => handleInputChange('specialties', e.target.value.split(',').map(s => s.trim()))}
                                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                                />
              </div>
            </div>
                          ) : (
                            <>
                              <h3 className="text-2xl font-semibold text-gray-800">{companyInfo.name}</h3>
                              <p className="text-[#BE185D] text-lg">{companyInfo.industry}</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {companyInfo.specialties.map((specialty, index) => (
                                  <span key={index} className="px-3 py-1 rounded-full bg-[#BE185D]/5 text-[#BE185D] text-sm">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
            </div>
          </div>

                      <div className="space-y-6">
                    <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">About Us</h4>
                      {isEditing ? (
                        <textarea
                          value={editedInfo?.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                          rows={4}
                        />
                      ) : (
                            <p className="text-gray-600 leading-relaxed">{companyInfo.description}</p>
                      )}
                    </div>

                        <div className="grid grid-cols-2 gap-6">
                    <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Main Services</h4>
                      {isEditing ? (
                              <div className="space-y-2">
                                {editedInfo?.mainServices.map((service, index) => (
                                  <div key={index} className="flex gap-2">
                        <input
                          type="text"
                                      value={service}
                                      onChange={(e) => {
                                        const newServices = [...editedInfo.mainServices];
                                        newServices[index] = e.target.value;
                                        handleInputChange('mainServices', newServices);
                                      }}
                                      className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                                    />
                                    <button
                                      onClick={() => {
                                        const newServices = editedInfo.mainServices.filter((_, i) => i !== index);
                                        handleInputChange('mainServices', newServices);
                                      }}
                                      className="px-2 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                    >
                                      ×
                                    </button>
                    </div>
                                ))}
                                <button
                                  onClick={() => handleInputChange('mainServices', [...editedInfo!.mainServices, ''])}
                                  className="w-full px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] hover:bg-[#BE185D]/10 transition-all"
                                >
                                  + Add Service
                                </button>
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {companyInfo.mainServices.map((service, index) => (
                                  <li key={index} className="flex items-center text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-[#BE185D] mr-2"></span>
                                    {service}
                                  </li>
                                ))}
                              </ul>
                      )}
                    </div>

                    <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Technologies</h4>
                      {isEditing ? (
                              <div className="space-y-2">
                                {editedInfo?.technologies.map((tech, index) => (
                                  <div key={index} className="flex gap-2">
                        <input
                          type="text"
                                      value={tech}
                                      onChange={(e) => {
                                        const newTech = [...editedInfo.technologies];
                                        newTech[index] = e.target.value;
                                        handleInputChange('technologies', newTech);
                                      }}
                                      className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                                    />
                                    <button
                                      onClick={() => {
                                        const newTech = editedInfo.technologies.filter((_, i) => i !== index);
                                        handleInputChange('technologies', newTech);
                                      }}
                                      className="px-2 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => handleInputChange('technologies', [...editedInfo!.technologies, ''])}
                                  className="w-full px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] hover:bg-[#BE185D]/10 transition-all"
                                >
                                  + Add Technology
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {companyInfo.technologies.map((tech, index) => (
                                  <span key={index} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                    </div>
                  </div>
                </div>

                    {/* Quick Stats & Info */}
                    <div className="space-y-6">
                      {/* Company Stats */}
                      <div className="bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Active Jobs</span>
                            <span className="text-[#BE185D] font-semibold">{jobs.length}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Total Applications</span>
                            <span className="text-[#BE185D] font-semibold">Coming Soon</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Hiring Success Rate</span>
                            <span className="text-[#BE185D] font-semibold">Coming Soon</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                            <label className="text-gray-600 text-sm">Website</label>
                      {isEditing ? (
                              <input
                                type="url"
                                value={editedInfo?.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                        />
                      ) : (
                              <a 
                                href={companyInfo.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block text-[#BE185D] hover:underline"
                              >
                                {companyInfo.website}
                              </a>
                      )}
                    </div>
                    <div>
                            <label className="text-gray-600 text-sm">Email</label>
                            <p className="text-gray-800">{companyEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <div className="bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Highlights</h4>
                      {isEditing ? (
                          <div className="space-y-2">
                            {editedInfo?.competitiveAdvantages.map((advantage, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={advantage}
                                  onChange={(e) => {
                                    const newAdvantages = [...editedInfo.competitiveAdvantages];
                                    newAdvantages[index] = e.target.value;
                                    handleInputChange('competitiveAdvantages', newAdvantages);
                                  }}
                                  className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                                />
                                <button
                                  onClick={() => {
                                    const newAdvantages = editedInfo.competitiveAdvantages.filter((_, i) => i !== index);
                                    handleInputChange('competitiveAdvantages', newAdvantages);
                                  }}
                                  className="px-2 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleInputChange('competitiveAdvantages', [...editedInfo!.competitiveAdvantages, ''])}
                              className="w-full px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] hover:bg-[#BE185D]/10 transition-all"
                            >
                              + Add Highlight
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {companyInfo.competitiveAdvantages.map((advantage, index) => (
                              <div key={index} className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-[#BE185D] mt-2 mr-2"></span>
                                <p className="text-gray-600 flex-1">{advantage}</p>
                              </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Products & Services Section */}
                  <div className="bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Products & Services</h4>
                    {isEditing ? (
                      <div className="space-y-4">
                          {editedInfo?.mainOfferings.map((offering, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={offering}
                                onChange={(e) => {
                                  const newOfferings = [...editedInfo.mainOfferings];
                                  newOfferings[index] = e.target.value;
                                  handleInputChange('mainOfferings', newOfferings);
                                }}
                              className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-1 focus:ring-[#BE185D] transition-all text-gray-800"
                              />
                              <button
                                onClick={() => {
                                  const newOfferings = editedInfo.mainOfferings.filter((_, i) => i !== index);
                                  handleInputChange('mainOfferings', newOfferings);
                                }}
                              className="px-2 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        <button
                          onClick={() => handleInputChange('mainOfferings', [...editedInfo!.mainOfferings, ''])}
                          className="w-full px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] hover:bg-[#BE185D]/10 transition-all"
                        >
                          + Add Product/Service
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companyInfo.mainOfferings.map((offering, index) => (
                          <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <h5 className="font-medium text-gray-800 mb-2">{offering}</h5>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-[#BE185D]">
                      Job Listings
                    </h2>
                    <button 
                      onClick={() => setShowJobPopup(true)}
                      className="px-4 py-2 rounded-lg bg-[#BE185D] text-white hover:bg-[#BE185D]/90 transition-all shadow-lg shadow-[#BE185D]/20"
                    >
                      Post New Job
                    </button>
                  </div>

                  {jobError && (
                    <div className="bg-red-50 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                      {jobError}
                    </div>
                  )}

                  <div className="grid gap-6">
                    {jobs && jobs.length > 0 ? jobs.map((job) => (
                      <div
                        key={job._id}
                        className="bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10 hover:border-[#BE185D]/30 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-semibold text-[#BE185D] mb-2">{job.title || 'Untitled Position'}</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.jobType && (
                                <span className="px-2 py-1 rounded-full bg-[#BE185D]/5 text-[#BE185D] text-sm">
                                  {job.jobType}
                                </span>
                              )}
                              {job.workLocation && (
                                <span className="px-2 py-1 rounded-full bg-[#BE185D]/5 text-[#BE185D] text-sm">
                                  {job.workLocation}
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full bg-[#BE185D]/5 text-[#BE185D] text-sm">
                                {formatSalary(job.salary)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleViewDetails(job)}
                              className="px-4 py-2 rounded-lg border border-[#BE185D]/50 text-[#BE185D] hover:bg-[#BE185D]/5 transition-all"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditJob(job)}
                              className="px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] hover:bg-[#BE185D]/10 transition-all"
                            >
                              Edit
                            </button>
                          <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
                                  handleDeleteJob(job._id);
                                }
                            }}
                              disabled={isDeletingJob && jobToDelete === job._id}
                              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {isDeletingJob && jobToDelete === job._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 bg-white rounded-xl shadow-md border border-[#BE185D]/10">
                        <FiBriefcase className="w-12 h-12 text-[#BE185D]/40 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No jobs posted yet</p>
                        <button 
                          onClick={() => setShowJobPopup(true)}
                          className="mt-4 px-4 py-2 rounded-lg bg-[#BE185D] text-white hover:bg-[#BE185D]/90 transition-all"
                        >
                          Post Your First Job
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Candidates Tab */}
              {activeTab === 'candidates' && (
                <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold">Candidate Pool</h2>
                      <button
                        onClick={handleResetCandidatePool}
                        disabled={isResetting || applications.length === 0}
                        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isResetting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                            Resetting...
                          </>
                        ) : (
                          'Reset Pool'
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      Total Applications: {applications.length}
                    </div>
                  </div>

                  {applicationsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BE185D]"></div>
                    </div>
                  ) : applicationsError ? (
                    <div className="bg-red-50 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                      {applicationsError}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md border border-[#BE185D]/10">
                      <FiUsers className="w-12 h-12 text-[#BE185D]/40 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No applications received yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {applications.map((application) => (
                        <div
                          key={application._id}
                          className="bg-white rounded-xl p-6 shadow-md border border-[#BE185D]/10 hover:border-[#BE185D]/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                      <div>
                              <h3 className="text-xl font-semibold text-[#BE185D] mb-1">
                                {application.candidateName}
                              </h3>
                              <p className="text-gray-600">Applied for: {application.jobTitle}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-500 text-sm">Email</p>
                              <p className="text-gray-800">{application.candidateEmail}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm">Phone</p>
                              <p className="text-gray-800">{application.candidatePhone || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm">Experience</p>
                              <p className="text-gray-800">{application.candidateExperience || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm">Applied On</p>
                              <p className="text-gray-800">{new Date(application.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {application.candidateSkills && application.candidateSkills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-gray-500 text-sm mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {application.candidateSkills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-[#BE185D] text-sm font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3">
                            {application.candidateResume && (
                              <a
                                href={application.candidateResume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg border border-[#BE185D]/50 text-[#BE185D] hover:bg-[#BE185D]/5 transition-all"
                              >
                                View Resume
                              </a>
                            )}
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="px-4 py-2 rounded-lg bg-[#BE185D]/5 text-[#BE185D] hover:bg-[#BE185D]/10 transition-all"
                            >
                              View Details
                            </button>
                  </div>
                </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* HR Management Tab */}
              {activeTab === 'hr' && (
                <section className="space-y-6">
                  <HRManagementTab />
                </section>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold">Recruitment Analytics</h2>
                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-lg border border-[#BE185D]/10">
                    <p className="text-gray-400">Coming soon: View detailed recruitment analytics and insights.</p>
                  </div>
                </section>
              )}

              {activeTab === 'ats' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Applicant Tracking System</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="px-4 py-2 rounded-lg border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20"
                          onChange={(e) => setFilterPercentage(Number(e.target.value))}
                          value={filterPercentage}
                        >
                          <option value="0">0% Match</option>
                          <option value="40">40% Match</option>
                          <option value="50">50% Match</option>
                          <option value="70">70% Match</option>
                        </select>
                        <button
                          onClick={handleFilterDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Below %'}
                        </button>
                      </div>
                      <button
                        onClick={fetchATSData}
                        className="px-4 py-2 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90 transition-colors"
                      >
                        Refresh Analysis
                      </button>
                    </div>
                  </div>

                  {isLoadingATS ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BE185D] mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing candidates...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {/* Good Matches */}
                        {atsData.allowed.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-green-700 mb-4">Recommended Candidates (≥70% Match)</h3>
                            <div className="space-y-4">
                              {atsData.allowed.map((candidate) => (
                                <div key={candidate.candidateId} className="bg-white rounded-lg p-6 border border-green-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h4 className="text-xl font-semibold text-gray-900">{candidate.name}</h4>
                                      <p className="text-gray-600">ID: {candidate.candidateId}</p>
                                    </div>
                                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                      {candidate.matchPercentage}% Match
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="text-gray-700">
                                      <span className="font-medium">Applied Role:</span> {candidate.appliedRole}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-medium">Recommended Roles:</span> {candidate.recommendedRoles.join(', ')}
                                    </p>
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                      <p className="text-green-700">{candidate.justification}</p>
                                      {candidate.matchingSkills && candidate.matchingSkills.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-sm font-medium text-green-700">Matching Skills:</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {candidate.matchingSkills.map((skill, index) => (
                                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                                                {skill}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medium Matches */}
                        {atsData.mediumMatch && atsData.mediumMatch.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-yellow-700 mb-4">Potential Candidates (50-69% Match)</h3>
                            <div className="space-y-4">
                              {atsData.mediumMatch.map((candidate) => (
                                <div key={candidate.candidateId} className="bg-white rounded-lg p-6 border border-yellow-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h4 className="text-xl font-semibold text-gray-900">{candidate.name}</h4>
                                      <p className="text-gray-600">ID: {candidate.candidateId}</p>
                                    </div>
                                    <span className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                                      {candidate.matchPercentage}% Match
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="text-gray-700">
                                      <span className="font-medium">Applied Role:</span> {candidate.appliedRole}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-medium">Recommended Roles:</span> {candidate.recommendedRoles.join(', ')}
                                    </p>
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                      <p className="text-yellow-700">{candidate.justification}</p>
                                      {candidate.matchingSkills && candidate.matchingSkills.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-sm font-medium text-yellow-700">Matching Skills:</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {candidate.matchingSkills.map((skill, index) => (
                                              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                                                {skill}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-sm font-medium text-yellow-700">Skills to Improve:</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {candidate.missingSkills.map((skill, index) => (
                                              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                                                {skill}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Not Recommended */}
                        {atsData.notAllowed.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-red-700 mb-4">Not Recommended Candidates (&lt;50% Match)</h3>
                            <div className="space-y-4">
                              {atsData.notAllowed.map((candidate) => (
                                <div key={candidate.candidateId} className="bg-white rounded-lg p-6 border border-red-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h4 className="text-xl font-semibold text-gray-900">{candidate.name}</h4>
                                      <p className="text-gray-600">ID: {candidate.candidateId}</p>
                                    </div>
                                    <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                                      {candidate.matchPercentage}% Match
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="text-gray-700">
                                      <span className="font-medium">Applied Role:</span> {candidate.appliedRole}
                                    </p>
                                    <p className="text-gray-700">
                                      <span className="font-medium">Recommended Roles:</span> {candidate.recommendedRoles.join(', ')}
                                    </p>
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                      <p className="text-red-700">{candidate.justification}</p>
                                      {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-sm font-medium text-red-700">Missing Skills:</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {candidate.missingSkills.map((skill, index) => (
                                              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm">
                                                {skill}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No candidates message */}
                        {atsData.allowed.length === 0 && (!atsData.mediumMatch || atsData.mediumMatch.length === 0) && atsData.notAllowed.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No candidates found in the ATS system.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Post Job Popup */}
      {showJobPopup && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[#BE185D]/10 p-6 flex justify-between items-start">
                      <div>
                <h2 className="text-2xl font-bold text-[#BE185D]">Post a New Job</h2>
                <p className="text-gray-600 mt-1">Fill in the details to create a new job listing</p>
              </div>
              <button
                onClick={() => setShowJobPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400 min-h-[120px]"
                          rows={4}
                  required
                        />
                      </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <input
                    type="text"
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                    placeholder="e.g. Full-time, Part-time"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                      </div>

                      <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Location</label>
                  <input
                    type="text"
                    value={newJob.workLocation}
                    onChange={(e) => setNewJob({ ...newJob, workLocation: e.target.value })}
                    placeholder="e.g. Remote, Hybrid, On-site"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    required
                        />
                      </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Hours</label>
                  <input
                    type="text"
                    value={newJob.workHours}
                    onChange={(e) => setNewJob({ ...newJob, workHours: e.target.value })}
                    placeholder="e.g. 9 AM - 5 PM"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        value={newJob.salary.min}
                        onChange={(e) => setNewJob({ ...newJob, salary: { ...newJob.salary, min: Number(e.target.value) } })}
                        placeholder="Min"
                        className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={newJob.salary.max}
                        onChange={(e) => setNewJob({ ...newJob, salary: { ...newJob.salary, max: Number(e.target.value) } })}
                        placeholder="Max"
                        className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <select
                        value={newJob.salary.currency}
                        onChange={(e) => setNewJob({ ...newJob, salary: { ...newJob.salary, currency: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                        required
                      >
                        <option value="₹">₹ (INR)</option>
                        <option value="$">$ (USD)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Required</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={newJob.experience.min}
                    onChange={(e) => setNewJob({ ...newJob, experience: { ...newJob.experience, min: Number(e.target.value) } })}
                    placeholder="Min years"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                  <input
                    type="number"
                    value={newJob.experience.max}
                    onChange={(e) => setNewJob({ ...newJob, experience: { ...newJob.experience, max: Number(e.target.value) } })}
                    placeholder="Max years"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={handleSkillsChange}
                    placeholder="Type skill and press comma to add"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20"
                  />
                  <div className="flex flex-wrap gap-2">
                    {newJob.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-50 text-pink-600">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-pink-400 hover:text-pink-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Benefits</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={handleBenefitsChange}
                    placeholder="Type benefit and press comma to add"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20"
                  />
                  <div className="flex flex-wrap gap-2">
                    {newJob.benefits.map((benefit, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-50 text-pink-600">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="ml-2 text-pink-400 hover:text-pink-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* After the benefits input */}
              
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Campus Recruitment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Drive Date</label>
                    <input
                      type="date"
                      value={newJob.campusRecruitment.driveDate}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        campusRecruitment: { ...newJob.campusRecruitment, driveDate: e.target.value }
                      })}
                      className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                    <input
                      type="date"
                      value={newJob.campusRecruitment.applicationDeadline}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        campusRecruitment: { ...newJob.campusRecruitment, applicationDeadline: e.target.value }
                      })}
                      className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Selection Process Steps (comma-separated)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={processInput}
                      onChange={handleProcessChange}
                      placeholder="Type step and press comma to add"
                      className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20"
                    />
                    <div className="flex flex-wrap gap-2">
                      {newJob.campusRecruitment.selectionProcess.map((process, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-50 text-pink-600">
                          {process}
                          <button
                            type="button"
                            onClick={() => removeProcess(index)}
                            className="ml-2 text-pink-400 hover:text-pink-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newJob.campusRecruitment.isActive}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        campusRecruitment: { ...newJob.campusRecruitment, isActive: e.target.checked }
                      })}
                      className="rounded border-[#BE185D]/30 text-[#BE185D] focus:ring-[#BE185D]/20"
                    />
                    <span className="text-sm font-semibold text-gray-700">Drive Active</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Eligibility Criteria</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={newJob.eligibilityCriteria.cgpa}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        eligibilityCriteria: { ...newJob.eligibilityCriteria, cgpa: Number(e.target.value) }
                      })}
                      className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Backlogs Allowed</label>
                    <input
                      type="number"
                      min="0"
                      value={newJob.eligibilityCriteria.backlogs}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        eligibilityCriteria: { ...newJob.eligibilityCriteria, backlogs: Number(e.target.value) }
                      })}
                      className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Eligible Branches (comma-separated)</label>
                  <input
                    type="text"
                    value={newJob.eligibilityCriteria.branches.join(', ')}
                    onChange={(e) => setNewJob({
                      ...newJob,
                      eligibilityCriteria: {
                        ...newJob.eligibilityCriteria,
                        branches: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    })}
                    placeholder="e.g. Computer Science, Information Technology, Electronics"
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year</label>
                  <input
                    type="number"
                    min={new Date().getFullYear()}
                    value={newJob.eligibilityCriteria.graduationYear}
                    onChange={(e) => setNewJob({
                      ...newJob,
                      eligibilityCriteria: {
                        ...newJob.eligibilityCriteria,
                        graduationYear: Number(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-[#BE185D]/30 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#BE185D]/10">
                <button
                  type="button"
                  onClick={() => setShowJobPopup(false)}
                  className="px-6 py-2.5 rounded-lg border-2 border-[#BE185D] text-[#BE185D] hover:bg-[#BE185D]/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-[#BE185D] text-white hover:bg-[#BE185D]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#BE185D]/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Posting...
                    </span>
                  ) : (
                    'Post Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Popup */}
      {selectedJob && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[#BE185D]/10 p-6 flex justify-between items-start">
                      <div>
                <h2 className="text-2xl font-bold text-[#BE185D]">{selectedJob.title}</h2>
                <p className="text-gray-600 mt-1">{selectedJob.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-500 text-sm">Job Type</h3>
                  <p className="text-gray-800">{selectedJob.jobType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Work Location</h3>
                  <p className="text-gray-800">{selectedJob.workLocation || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Work Hours</h3>
                  <p className="text-gray-800">{selectedJob.workHours || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Salary</h3>
                  <p className="text-gray-800">{formatSalary(selectedJob.salary)}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Experience Required</h3>
                  <p className="text-gray-800">
                    {typeof selectedJob.experience === 'object' && selectedJob.experience !== null ? 
                      `${selectedJob.experience.min} - ${selectedJob.experience.max} years` : 
                      selectedJob.experience || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {/* Skills */}
              {selectedJob.skills && (Array.isArray(selectedJob.skills) ? selectedJob.skills : []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedJob.skills) ? selectedJob.skills : []).map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-[#BE185D]/10 text-[#BE185D]">
                        {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

              {/* Benefits */}
              {selectedJob.benefits && (Array.isArray(selectedJob.benefits) ? selectedJob.benefits : []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Benefits</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {(Array.isArray(selectedJob.benefits) ? selectedJob.benefits : []).map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                  </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p>Posted: {new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p>Last Updated: {new Date(selectedJob.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
                </div>
              </div>
            )}

      {/* Application Details Popup */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[#BE185D]/10 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-[#BE185D]">{selectedApplication.candidateName}</h2>
                <p className="text-gray-600 mt-1">Application for {selectedApplication.jobTitle}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                  </button>
                </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-500 text-sm">Email</h3>
                  <p className="text-gray-800">{selectedApplication.candidateEmail}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Phone</h3>
                  <p className="text-gray-800">{selectedApplication.candidatePhone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Application Status</h3>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${
                    selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedApplication.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </p>
                </div>
              </div>

              {/* Experience */}
              {selectedApplication.candidateExperience && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">Experience</h3>
                  <p className="text-gray-800">{selectedApplication.candidateExperience}</p>
                </div>
              )}

              {/* Skills */}
              {selectedApplication.candidateSkills && selectedApplication.candidateSkills.length > 0 && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.candidateSkills.map((skill, index) => (
                      <span
                      key={index}
                        className="px-3 py-1 rounded-full bg-[#BE185D]/10 text-[#BE185D]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.candidateResume && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">Resume</h3>
                  <a
                    href={selectedApplication.candidateResume}
                        target="_blank"
                        rel="noopener noreferrer"
                    className="inline-block px-4 py-2 rounded-lg border border-[#BE185D] text-[#BE185D] hover:bg-[#BE185D]/5 transition-all"
                      >
                    View Resume
                      </a>
                    </div>
              )}

              {/* Timeline */}
              <div className="pt-4 border-t border-[#BE185D]/10">
                <div className="flex justify-between text-gray-500 text-sm">
                  <p>Applied on: {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(selectedApplication.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
                </div>
              </div>
            )}

      {/* Edit Job Popup */}
      {editingJob && (
        <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[#BE185D]/10 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-[#BE185D]">{editingJob.title}</h2>
                <p className="text-gray-600 mt-1">{editingJob.companyName}</p>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-500 text-sm">Job Type</h3>
                  <p className="text-gray-800">{editingJob.jobType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Work Location</h3>
                  <p className="text-gray-800">{editingJob.workLocation || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Work Hours</h3>
                  <p className="text-gray-800">{editingJob.workHours || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Salary</h3>
                  <p className="text-gray-800">{formatSalary(editingJob.salary)}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Experience Required</h3>
                  <p className="text-gray-800">
                    {typeof editingJob.experience === 'object' && editingJob.experience !== null ? 
                      `${editingJob.experience.min} - ${editingJob.experience.max} years` : 
                      editingJob.experience || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{editingJob.description}</p>
              </div>

              {/* Skills */}
              {editingJob.skills && (Array.isArray(editingJob.skills) ? editingJob.skills : []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(editingJob.skills) ? editingJob.skills : []).map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-[#BE185D]/10 text-[#BE185D]">
                        {skill}
                      </span>
                    ))}
                  </div>
              </div>
            )}

              {/* Benefits */}
              {editingJob.benefits && (Array.isArray(editingJob.benefits) ? editingJob.benefits : []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Benefits</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {(Array.isArray(editingJob.benefits) ? editingJob.benefits : []).map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
              </div>
            )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p>Posted: {new Date(editingJob.createdAt).toLocaleDateString()}</p>
      </div>
                <div>
                  <p>Last Updated: {new Date(editingJob.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          toastMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </>
  );
} 