import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

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
  };
  workLocation: string;
  workHours: string;
  jobType: string;
  experience: {
    min: number;
    max: number;
  };
  skills: string[];
  benefits: string[];
}

interface ApplicationStatus {
  hasApplied: boolean;
  applicationDate?: string;
}

export default function ApplicationSuccess() {
  const router = useRouter();
  const { jobId } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({ hasApplied: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (!jobResponse.ok) {
          throw new Error('Failed to fetch job details');
        }
        
        const jobData = await jobResponse.json();
        setJob(jobData.job);

        // Only fetch application status if we successfully got job details
        const applicationResponse = await fetch(`/api/jobs/application-status/${jobId}`);
        if (applicationResponse.ok) {
          const applicationData = await applicationResponse.json();
          setApplicationStatus(applicationData);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BE185D]"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400">{error || 'Job not found'}</p>
          <Link
            href="/jobs"
            className="inline-block px-6 py-3 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90 transition-colors"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified';
    const { min, max, currency = '₹' } = salary;
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };

  return (
    <>
      <Head>
        <title>{applicationStatus.hasApplied ? 'Already Applied' : 'Application Submitted'} - Mockello</title>
        <meta name="description" content="Job application status" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-[#BE185D]/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">
                  Mockello
                </span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-20 container mx-auto px-6 py-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#BE185D]/10 flex items-center justify-center">
                {applicationStatus.hasApplied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold">
              {applicationStatus.hasApplied 
                ? 'You have already applied for this position!'
                : 'Application Submitted Successfully!'}
            </h1>
            
            <div className="bg-white/5 rounded-xl p-8 backdrop-blur-lg border border-[#BE185D]/10 text-left">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#BE185D]">{job.title}</h2>
                  <p className="text-xl text-gray-300">{job.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-400">Job Type</p>
                    <p className="text-white">{job.jobType}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">Location</p>
                    <p className="text-white">{job.workLocation}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">Work Hours</p>
                    <p className="text-white">{job.workHours}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">Salary Range</p>
                    <p className="text-white">{formatSalary(job.salary)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-400">Experience Required</p>
                  <p className="text-white">{job.experience.min} - {job.experience.max} years</p>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-gray-400">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-[#BE185D]/10 text-[#BE185D] text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.benefits && job.benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-gray-400">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit, index) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-[#BE185D]/10 text-[#BE185D] text-sm">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-gray-400">Job Description</p>
                  <p className="text-white whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-300">
              {applicationStatus.hasApplied 
                ? `You applied for this position on ${new Date(applicationStatus.applicationDate!).toLocaleDateString()}`
                : 'Thank you for applying! The company will review your application and contact you if they find your profile suitable for the position.'}
            </p>

            <div className="flex justify-center pt-4">
              <Link
                href="/jobs"
                className="px-6 py-3 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90 transition-colors"
              >
                Browse More Jobs
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 