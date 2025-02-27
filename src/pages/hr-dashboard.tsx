import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { LoadingSVG } from '@/components/button/LoadingSVG';
import { ToastProvider, useToast } from '@/components/toast/ToasterProvider';

interface HRProfile {
  name: string;
  dob: string;
  phone: string;
  company: string;
  hiringRoles: string[];
  hrUniqueId?: string;
}

interface RoleplayPrompt {
  company: string;
  role: string;
  expectations: string;
}

interface SessionFeedback {
  feedback: string;
  interviewDate: string;
  interviewTime: string;
  name: string;
  performancePercentage: number;
  registerNumber: string;
  sessionId: string;
  stars: number;
  timestamp: string;
  totalWords: number;
  transcriptionCount: number;
  email?: string;
}

interface Session {
  id: string;
  createdAt: string;
  studentEmails: string[];
  emailsSent: boolean;
  roleplayPrompt: RoleplayPrompt;
  candidateName?: string;
  candidateEmail?: string;
  candidateDetails?: {
    name: string;
    email: string;
    registerNumber?: string;
    [key: string]: any;
  };
  feedback?: SessionFeedback;
}

interface FeedbackData {
  feedback: string;
  interviewDate: string;
  interviewTime: string;
  name: string;
  performancePercentage: number;
  registerNumber: string;
  sessionId: string;
  stars: number;
  timestamp: string;
  totalWords: number;
  transcriptionCount: number;
  email?: string;
}

interface KeyLimits {
  validityDays: number;
  interviewLimit: number;
  studentsPerInterview: number;
  usedInterviews: number;
  createdAt: string;
}

interface FirebaseSession {
  sessionId: string;
  hrName: string;
  hrCompany: string;
  hrIdentifier: string;
  studentLimit: number;
  currentStudents: number;
  invitedEmails: string[];
  roleplayPrompt: string;
  createdAt: string;
  feedback?: string;
  interviewDate?: string;
  interviewTime?: string;
  name?: string;
  performancePercentage?: number;
  registerNumber?: string;
  stars?: number;
  timestamp?: string;
  totalWords?: number;
  transcriptionCount?: number;
  email?: string;
}

interface AssignedCandidate {
  _id: string;
  mockelloId: string;
  fullName: string;
  email: string;
  phone?: string;
  appliedRole: string;
  status: string;
  appliedAt: string;
  assignedAt: string;
  resumeUrl?: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects?: string[];
  achievements?: string[];
  interests?: string[];
  analysis?: string;
  roleInfo: {
    role: string;
    status: string;
    appliedAt: string;
  };
}

interface InterviewCandidate {
  email: string;
  name: string;
  sessionId: string;
  batchId: string;
}

interface InterviewBatch {
  batchId: string;
  timestamp: string;
  candidates: InterviewCandidate[];
}

interface RequiredSkills {
  technicalSkills: string[];
  softSkills: string[];
}

interface CompanyBilling {
  credits: number;
  creditsUsed: number;
  totalSessions: number;
  totalMaxSessions: number;
}

function HRDashboardInner() {
  const router = useRouter();
  const { toastMessage, setToastMessage } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hrData, setHRData] = useState<any>(null);
  const [profile, setProfile] = useState<HRProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<HRProfile | null>(null);
  const [newRole, setNewRole] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [latestSession, setLatestSession] = useState<Session | null>(null);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showPreviousSessions, setShowPreviousSessions] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [sessionFeedbacks, setSessionFeedbacks] = useState<{[key: string]: FeedbackData[]}>({});
  const [selectedCandidates, setSelectedCandidates] = useState<{[key: string]: Set<string>}>({});
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [processingSession, setProcessingSession] = useState<string | null>(null);
  const [tempEmails, setTempEmails] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(true);
  const [authKey, setAuthKey] = useState<string | null>(null);
  const [keyLimits, setKeyLimits] = useState<KeyLimits | null>(null);
  const [roleplayPrompt, setRoleplayPrompt] = useState({
    company: '',
    role: '',
    expectations: ''
  });
  const [assignedCandidates, setAssignedCandidates] = useState<AssignedCandidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<AssignedCandidate | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [pendingInterviews, setPendingInterviews] = useState(0);
  const [isLoadingCandidateDetails, setIsLoadingCandidateDetails] = useState(false);
  const [completeCandidate, setCompleteCandidate] = useState<AssignedCandidate | null>(null);
  const [selectedCandidatesForInvite, setSelectedCandidatesForInvite] = useState<Set<string>>(new Set());
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [interviewBatches, setInterviewBatches] = useState<InterviewBatch[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkills>({
    technicalSkills: [],
    softSkills: []
  });
  const [newSkill, setNewSkill] = useState({ technical: '', soft: '' });
  const [skillRecommendations, setSkillRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [currentSkillType, setCurrentSkillType] = useState<'technical' | 'soft'>('technical');
  const [selectedFeedback, setSelectedFeedback] = useState<SessionFeedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [companyBilling, setCompanyBilling] = useState<CompanyBilling>({
    credits: 0,
    creditsUsed: 0,
    totalSessions: 0,
    totalMaxSessions: 0
  });

  useEffect(() => {
    // Check if HR is authenticated
    const storedHRData = localStorage.getItem('hr_data');
    
    if (!storedHRData) {
      router.push('/hr-login');
      return;
    }

    try {
      const parsedHRData = JSON.parse(storedHRData);
      console.log('HR Data:', parsedHRData); // Debug log
      setHRData(parsedHRData);
      
      // Fetch data only if we have the uniqueId
      if (parsedHRData._id) {
        fetchHRInfo(parsedHRData._id);
        fetchAssignedCandidates(parsedHRData._id);
        fetchPendingInterviews();
        fetchInterviewSessions();
      }
    } catch (error) {
      console.error('Error parsing HR data:', error);
      router.push('/hr-login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (showSkillsModal) {
      getSkillRecommendations(currentSkillType);
    }
  }, [showSkillsModal, currentSkillType]);

  const fetchHRInfo = async (hrId: string) => {
    try {
      const response = await fetch(`/api/hr/info?hrId=${hrId}`);
      if (!response.ok) throw new Error('Failed to fetch HR info');
      
      const data = await response.json();
      console.log('Received HR info:', data);
      
      if (data.companyBilling) {
        setCompanyBilling({
          credits: data.companyBilling.credits || 0,
          creditsUsed: data.companyBilling.creditsUsed || 0,
          totalSessions: data.companyBilling.totalSessions || 0,
          totalMaxSessions: data.companyBilling.totalMaxSessions || 0
        });
      } else {
        console.error('No billing data received:', data);
      }
    } catch (error) {
      console.error('Error fetching HR info:', error);
      setToastMessage({
        type: 'error',
        message: 'Failed to fetch company information'
      });
    }
  };

  const fetchAssignedCandidates = async (hrId: string) => {
    try {
      setIsLoadingCandidates(true);
      const response = await fetch(`/api/hr/assigned-candidates?hrId=${hrId}`);
      if (!response.ok) throw new Error('Failed to fetch assigned candidates');
      
      const data = await response.json();
      setAssignedCandidates(data.candidates);
    } catch (error) {
      console.error('Error fetching assigned candidates:', error);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const fetchPendingInterviews = async () => {
    try {
      // Get HR data from local storage
      const hrDataStr = localStorage.getItem('hr_data');
      if (!hrDataStr) {
        console.error('No HR data found in local storage');
        return;
      }

      const parsedHRData = JSON.parse(hrDataStr);
      // Use the HR's unique ID
      const hrUniqueId = parsedHRData.uniqueId;
      
      if (!hrUniqueId) {
        console.error('No HR unique ID found in stored data:', parsedHRData);
        return;
      }

      console.log('Fetching sessions for HR unique ID:', hrUniqueId);
      const response = await fetch(`/api/hr/pending-interviews?hrId=${hrUniqueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending interviews');
      }

      const data = await response.json();
      console.log('Fetched sessions:', data);
      setPendingInterviews(data.pendingCount);
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching pending interviews:', error);
      setToastMessage({
        type: 'error',
        message: 'Failed to fetch pending interviews'
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('hr_data');
    router.push('/hr-login');
  };

  const fetchCompleteCandidateData = async (mockelloId: string) => {
    try {
      setIsLoadingCandidateDetails(true);
      const response = await fetch(`/api/candidates/details?mockelloId=${mockelloId}`);
      if (!response.ok) throw new Error('Failed to fetch candidate details');
      
      const data = await response.json();
      if (data.candidate) {
        setCompleteCandidate({
          ...selectedCandidate!,
          ...data.candidate
        });
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setIsLoadingCandidateDetails(false);
    }
  };

  const handleCandidateClick = (candidate: AssignedCandidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleViewResume = async (mockelloId: string) => {
    try {
      setIsLoadingCandidateDetails(true);
      const response = await fetch(`/api/candidates/details?mockelloId=${mockelloId}`);
      if (!response.ok) throw new Error('Failed to fetch candidate details');
      
      const data = await response.json();
      if (data.candidate) {
        // Create modal container
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.top = '0';
        modalDiv.style.left = '0';
        modalDiv.style.width = '100%';
        modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalDiv.style.backdropFilter = 'blur(4px)';
        modalDiv.style.display = 'flex';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.zIndex = '9999';
        modalDiv.style.padding = '2rem';

        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.style.backgroundColor = 'white';
        contentDiv.style.borderRadius = '1rem';
        contentDiv.style.maxWidth = '800px';
        contentDiv.style.width = '100%';
        contentDiv.style.maxHeight = '90vh';
        contentDiv.style.overflowY = 'auto';
        contentDiv.style.position = 'relative';

        // Create header
        const header = document.createElement('div');
        header.style.padding = '2rem';
        header.style.background = 'linear-gradient(to right, #BE185D, #9D174D)';
        header.style.borderRadius = '1rem 1rem 0 0';
        header.style.color = 'white';

        const headerContent = document.createElement('div');
        headerContent.style.maxWidth = '70%';

        const title = document.createElement('h2');
        title.style.fontSize = '2.25rem';
        title.style.fontWeight = '600';
        title.style.marginBottom = '0.75rem';
        title.textContent = data.candidate.fullName;

        const contactInfo = document.createElement('div');
        contactInfo.style.display = 'flex';
        contactInfo.style.flexWrap = 'wrap';
        contactInfo.style.gap = '0.75rem';
        contactInfo.style.color = 'rgba(255, 255, 255, 0.9)';
        contactInfo.style.fontSize = '0.875rem';

        // Add email
        const emailSpan = document.createElement('span');
        emailSpan.style.display = 'flex';
        emailSpan.style.alignItems = 'center';
        emailSpan.style.gap = '0.5rem';
        emailSpan.textContent = data.candidate.email;

        // Add phone if available
        if (data.candidate.phone) {
          const phoneSpan = document.createElement('span');
          phoneSpan.style.display = 'flex';
          phoneSpan.style.alignItems = 'center';
          phoneSpan.style.gap = '0.5rem';
          phoneSpan.textContent = data.candidate.phone;
          contactInfo.appendChild(phoneSpan);
        }

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '1rem';
        closeButton.style.right = '1rem';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';
        closeButton.innerHTML = '×';
        closeButton.style.fontSize = '24px';
        closeButton.onclick = () => document.body.removeChild(modalDiv);

        // Assemble header
        headerContent.appendChild(title);
        headerContent.appendChild(contactInfo);
        header.appendChild(headerContent);
        header.appendChild(closeButton);
        contentDiv.appendChild(header);

        // Create main content
        const mainContent = document.createElement('div');
        mainContent.style.padding = '2rem';

        // Add sections (skills, experience, education, etc.)
        const sections = [
          { title: 'Skills', data: data.candidate.skills },
          { title: 'Experience', data: data.candidate.experience },
          { title: 'Education', data: data.candidate.education },
          { title: 'Projects', data: data.candidate.projects },
          { title: 'Achievements', data: data.candidate.achievements },
          { title: 'Interests', data: data.candidate.interests }
        ] as const;

        sections.forEach(section => {
          if (section.data && section.data.length > 0) {
            const sectionDiv = document.createElement('div');
            sectionDiv.style.marginBottom = '2rem';

            const sectionTitle = document.createElement('h3');
            sectionTitle.style.fontSize = '1rem';
            sectionTitle.style.fontWeight = '600';
            sectionTitle.style.color = '#111827';
            sectionTitle.style.marginBottom = '1rem';
            sectionTitle.textContent = section.title;

            const sectionContent = document.createElement('div');
            if (section.title === 'Skills') {
              sectionContent.style.display = 'flex';
              sectionContent.style.flexWrap = 'wrap';
              sectionContent.style.gap = '0.5rem';
              section.data.forEach((skill: string) => {
                const skillSpan = document.createElement('span');
                skillSpan.style.padding = '0.375rem 0.75rem';
                skillSpan.style.backgroundColor = '#F3F4F6';
                skillSpan.style.borderRadius = '0.375rem';
                skillSpan.style.fontSize = '0.875rem';
                skillSpan.style.color = '#374151';
                skillSpan.textContent = skill;
                sectionContent.appendChild(skillSpan);
              });
            } else {
              sectionContent.style.display = 'flex';
              sectionContent.style.flexDirection = 'column';
              sectionContent.style.gap = '1rem';
              section.data.forEach((item: string) => {
                const itemDiv = document.createElement('div');
                itemDiv.style.backgroundColor = '#F9FAFB';
                itemDiv.style.padding = '1rem';
                itemDiv.style.borderRadius = '0.5rem';
                if (section.title === 'Experience') {
                  itemDiv.style.borderLeft = '4px solid #BE185D';
                }
                itemDiv.textContent = item;
                sectionContent.appendChild(itemDiv);
              });
            }

            sectionDiv.appendChild(sectionTitle);
            sectionDiv.appendChild(sectionContent);
            mainContent.appendChild(sectionDiv);
          }
        });

        contentDiv.appendChild(mainContent);
        modalDiv.appendChild(contentDiv);
        document.body.appendChild(modalDiv);

        // Close modal when clicking outside
        modalDiv.addEventListener('click', (e) => {
          if (e.target === modalDiv) {
            document.body.removeChild(modalDiv);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setIsLoadingCandidateDetails(false);
    }
  };

  // Add function to handle candidate selection
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidatesForInvite(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  // Update handleSendInvitations to include candidate details
  const handleSendInvitations = async () => {
    if (selectedCandidatesForInvite.size === 0) {
      alert('Please select at least one candidate to invite.');
      return;
    }

    // Validate required skills
    if (requiredSkills.technicalSkills.length === 0) {
      alert('Please add at least one technical skill.');
      return;
    }

    if (requiredSkills.softSkills.length === 0) {
      alert('Please add at least one soft skill.');
      return;
    }

    try {
      setIsSendingInvites(true);
      const selectedCandidates = assignedCandidates.filter(c => selectedCandidatesForInvite.has(c.mockelloId));
      
      const response = await fetch('/api/hr/send-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hrId: hrData._id,
          hrName: hrData.username,
          hrUniqueId: hrData.uniqueId,
          candidates: selectedCandidates.map(c => ({
            email: c.email,
            name: c.fullName,
            mockelloId: c.mockelloId
          })),
          requiredSkills,
          assignedCandidates: selectedCandidates // Include full candidate details
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to prepare email');
      }

      const result = await response.json();
      console.log('Email preparation successful:', result);

      // Store the batch information
      const currentBatch = {
        batchId: result.batchId,
        timestamp: new Date().toISOString(),
        candidates: result.recipients
      };

      // Store batch information in localStorage
      const storedBatches = JSON.parse(localStorage.getItem(`interview_batches_${hrData.uniqueId}`) || '[]');
      storedBatches.unshift(currentBatch);
      localStorage.setItem(`interview_batches_${hrData.uniqueId}`, JSON.stringify(storedBatches));

      // Open default email client with the mailto URL
      window.location.href = result.mailtoUrl;

      // Clear selections and close modal
      setSelectedCandidatesForInvite(new Set());
      setShowSkillsModal(false);
      
      // Reset skills state
      setRequiredSkills({
        technicalSkills: [],
        softSkills: []
      });
      
      alert('Email client opened with invitation details!');
    } catch (error) {
      console.error('Error preparing invitations:', error);
      alert(error instanceof Error ? error.message : 'Failed to prepare invitations. Please try again.');
    } finally {
      setIsSendingInvites(false);
    }
  };

  // Modify getSkillRecommendations to handle empty skills
  const getSkillRecommendations = async (type: 'technical' | 'soft') => {
    try {
      setIsLoadingRecommendations(true);
      const currentSkills = type === 'technical' ? requiredSkills.technicalSkills : requiredSkills.softSkills;
      
      // If no skills added yet, use the role as context
      const response = await fetch('/api/hr/get-skill-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSkills: currentSkills.length > 0 ? currentSkills : [],
          skillType: type,
          role: selectedCandidate?.appliedRole || 'software developer' // Default role if none specified
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      console.log('Received recommendations:', data.recommendations); // Debug log
      setSkillRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting skill recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Modify handleAddSkill to refresh recommendations immediately
  const handleAddSkill = async (type: 'technical' | 'soft') => {
    const skill = type === 'technical' ? newSkill.technical.trim() : newSkill.soft.trim();
    if (!skill) return;

    // Update skills first
    const updatedSkills = [
      ...requiredSkills[type === 'technical' ? 'technicalSkills' : 'softSkills'],
      skill
    ];

    setRequiredSkills(prev => ({
      ...prev,
      [type === 'technical' ? 'technicalSkills' : 'softSkills']: updatedSkills
    }));

    setNewSkill(prev => ({
      ...prev,
      [type]: ''
    }));

    // Get new recommendations based on the updated skills list
    try {
      setIsLoadingRecommendations(true);
      const response = await fetch('/api/hr/get-skill-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSkills: updatedSkills,
          skillType: type,
          role: selectedCandidate?.appliedRole || 'software developer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      console.log('Received recommendations after adding skill:', data.recommendations);
      setSkillRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Add function to switch skill type
  const handleSkillTypeChange = (type: 'technical' | 'soft') => {
    setCurrentSkillType(type);
    setSkillRecommendations([]); // Clear existing recommendations
    getSkillRecommendations(type); // Get new recommendations for the selected type
  };

  // Add function to handle recommendation click
  const handleRecommendationClick = (skill: string, type: 'technical' | 'soft') => {
    setRequiredSkills(prev => ({
      ...prev,
      [type === 'technical' ? 'technicalSkills' : 'softSkills']: [
        ...prev[type === 'technical' ? 'technicalSkills' : 'softSkills'],
        skill
      ]
    }));
    setSkillRecommendations(prev => prev.filter(s => s !== skill));
  };

  // Also update handleRemoveSkill to refresh recommendations
  const handleRemoveSkill = async (type: 'technical' | 'soft', skillToRemove: string) => {
    const updatedSkills = requiredSkills[type === 'technical' ? 'technicalSkills' : 'softSkills']
      .filter(skill => skill !== skillToRemove);

    setRequiredSkills(prev => ({
      ...prev,
      [type === 'technical' ? 'technicalSkills' : 'softSkills']: updatedSkills
    }));

    // Get new recommendations based on the updated skills list
    try {
      setIsLoadingRecommendations(true);
      const response = await fetch('/api/hr/get-skill-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSkills: updatedSkills,
          skillType: type,
          role: selectedCandidate?.appliedRole || 'software developer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      console.log('Received recommendations after removing skill:', data.recommendations);
      setSkillRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Update the fetchInterviewSessions function
  const fetchInterviewSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const storedHRData = localStorage.getItem('hr_data');
      
      if (!storedHRData) {
        console.error('No HR data found');
        return;
      }

      const parsedHRData = JSON.parse(storedHRData);
      if (!parsedHRData || !parsedHRData.uniqueId) {
        console.error('Invalid HR data structure:', parsedHRData);
        return;
      }

      console.log('Fetching sessions for HR:', parsedHRData.uniqueId);
      const response = await fetch(`/api/hr/pending-interviews?hrId=${parsedHRData.uniqueId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch interview sessions');
      }

      const data = await response.json();
      console.log('Fetched sessions:', data);
      
      // Sort sessions by creation date (newest first)
      const sortedSessions = data.sessions.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // For each session, fetch its feedback
      const sessionsWithFeedback = await Promise.all(
        sortedSessions.map(async (session: Session) => {
          if (!session.feedback) {
            return session;
          }

          // Get the candidate name from the session data if available
          const candidateName = session.candidateDetails?.name || 
                                session.candidateName || 
                                (session.studentEmails && session.studentEmails[0]?.split('@')[0]) || 
                                'Guest User';

          return {
            ...session,
            feedback: {
              ...session.feedback,
              name: session.feedback.name === 'Guest User' ? candidateName : session.feedback.name
            }
          };
        })
      );

      setSessions(sessionsWithFeedback);
    } catch (error) {
      console.error('Error fetching interview sessions:', error);
      setToastMessage({
        type: 'error',
        message: 'Failed to fetch interview sessions'
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Add this new component for the Interview Results section
  const InterviewResultsSection = ({ sessions }: { sessions: Session[] }) => {
    const completedSessions = sessions.filter((session): session is Session & { feedback: SessionFeedback } => 
      session.feedback !== undefined && session.feedback !== null
    );

    // Sort sessions by performance percentage in descending order
    const rankedSessions = [...completedSessions].sort((a, b) => 
      (b.feedback.performancePercentage - a.feedback.performancePercentage)
    );

    if (completedSessions.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No completed interviews yet
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Words & Responses
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankedSessions.map((session, index) => {
                const candidateName = session.candidateDetails?.name || 
                                    session.candidateName || 
                                    (session.studentEmails && session.studentEmails[0]?.split('@')[0]) || 
                                    'Guest User';

                // Determine rank style based on position
                const rankStyle = index === 0 
                  ? 'bg-yellow-100 text-yellow-800' // 1st place
                  : index === 1 
                  ? 'bg-gray-100 text-gray-800' // 2nd place
                  : index === 2 
                  ? 'bg-orange-100 text-orange-800' // 3rd place
                  : 'bg-white text-gray-600'; // Other places

                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${rankStyle}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{session.feedback.interviewDate}</div>
                      <div className="text-gray-500">{session.feedback.interviewTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{candidateName}</div>
                      <div className="text-sm text-gray-500">
                        {session.candidateDetails?.registerNumber || session.feedback.registerNumber || 'GUEST'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        session.feedback.performancePercentage >= 80 ? 'text-green-600' :
                        session.feedback.performancePercentage >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {session.feedback.performancePercentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-yellow-500">
                        {'★'.repeat(session.feedback.stars)}
                        {'☆'.repeat(5 - session.feedback.stars)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Words: {session.feedback.totalWords}</div>
                      <div className="text-sm text-gray-500">Responses: {session.feedback.transcriptionCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedFeedback(session.feedback);
                          setShowFeedbackModal(true);
                        }}
                        className="text-[#BE185D] hover:text-[#BE185D]/80 font-medium text-sm"
                      >
                        View Feedback
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative mt-16">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Interview Feedback</h3>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedFeedback(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedFeedback.name}</h4>
                      <p className="text-sm text-gray-500">{selectedFeedback.registerNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#BE185D]">
                        {selectedFeedback.performancePercentage}%
                      </div>
                      <div className="text-yellow-500">
                        {'★'.repeat(selectedFeedback.stars)}
                        {'☆'.repeat(5 - selectedFeedback.stars)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{selectedFeedback.interviewDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{selectedFeedback.interviewTime}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Total Words</p>
                        <p className="font-medium">{selectedFeedback.totalWords}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Responses</p>
                        <p className="font-medium">{selectedFeedback.transcriptionCount}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Feedback</p>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                        {selectedFeedback.feedback}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Update the renderSessions function
  const renderSessions = () => {
    if (!sessions || sessions.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No interview sessions found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => {
          const candidateName = session.candidateDetails?.name || 
                              session.candidateName || 
                              (session.studentEmails && session.studentEmails[0]?.split('@')[0]) || 
                              'Guest User';

          return (
            <div key={session.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Session ID: {session.id.slice(-6)}</h3>
                  <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
                </div>
                {session.feedback ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Completed
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const viewFeedback = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/hr/session-feedback?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      // You can implement how you want to display the feedback
      // For example, setting it in a state and showing in a modal
      console.log('Session feedback:', data);
    } catch (error) {
      console.error('Error viewing feedback:', error);
      setToastMessage({
        type: 'error',
        message: 'Failed to fetch feedback'
      });
    }
  };

  const ScheduleModal = () => {
    const pendingSessions = sessions.filter(session => !session.feedback);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto relative mt-16">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Pending Interviews</h3>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            {pendingSessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No pending interviews at the moment
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSessions.map((session) => {
                  const candidateName = session.candidateDetails?.name || 
                                      session.candidateName || 
                                      (session.studentEmails && session.studentEmails[0]?.split('@')[0]) || 
                                      'Guest User';
                  const email = session.candidateDetails?.email || 
                              session.candidateEmail || 
                              session.studentEmails?.[0] || 
                              'No email provided';

                  return (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#BE185D]/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{candidateName}</h4>
                          <p className="text-sm text-gray-500">{email}</p>
                          <p className="text-xs text-gray-400 mt-1">Session ID: {session.id.slice(-6)}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Pending
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BE185D] mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hrData) return null;

  return (
    <>
      <Head>
        <title>HR Dashboard - Mockello</title>
        <meta name="description" content="HR dashboard for managing candidates and interviews" />
      </Head>

      <main className="min-h-screen bg-gray-50 relative">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-40 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="absolute inset-0 bg-[radial-gradient(#BE185D_0.8px,transparent_0.8px)] [background-size:16px_16px]"></div>
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200" style={{ zIndex: 40 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-900">
                  Mockello
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{hrData.companyName}</span>
              </div>
              <div className="flex items-center gap-4">
                {/* Add billing info display */}
                <div className="flex items-center gap-4 px-4 py-2 bg-[#BE185D]/5 rounded-lg border border-[#BE185D]/10">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-600">Credits Available</span>
                    <span className="font-medium text-[#BE185D]">{companyBilling.credits - companyBilling.creditsUsed}</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-600">Total Credits</span>
                    <span className="font-medium text-[#BE185D]">{companyBilling.credits}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#BE185D]/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">{hrData.username}</span>
                    <span className="text-xs text-gray-500">ID: {hrData.uniqueId}</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-20 pb-12 relative" style={{ zIndex: 10 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back, {hrData.name}</h1>
                  <p className="text-gray-600 mt-2">Here's an overview of your assigned candidates and upcoming interviews.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Assigned Candidates</p>
                    <p className="text-2xl font-bold text-[#BE185D]">{assignedCandidates.length}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pending Interviews</p>
                    <p className="text-2xl font-bold text-[#BE185D]">{pendingInterviews}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-6">
              {/* Assigned Candidates */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:border-[#BE185D]/30 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#BE185D]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Assigned Candidates</h3>
                      <p className="text-gray-500 text-sm">
                        {isLoadingCandidates 
                          ? 'Loading candidates...' 
                          : `${assignedCandidates.length} candidates assigned`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedCandidatesForInvite.size > 0 && (
                      <button
                        onClick={() => setShowSkillsModal(true)}
                        disabled={isSendingInvites}
                        className="px-4 py-2 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingInvites ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send Invitations ({selectedCandidatesForInvite.size})
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {isLoadingCandidates ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BE185D] mx-auto"></div>
                    </div>
                  ) : assignedCandidates.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No candidates assigned yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Assigned Candidates</h2>
                        <div className="space-y-4">
                          {assignedCandidates.map((candidate) => (
                            <div
                              key={candidate.mockelloId}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleCandidateClick(candidate)}
                            >
                              <div className="flex-1">
                                <h3 className="font-medium">{candidate.fullName}</h3>
                                <p className="text-sm text-gray-500">ID: {candidate.mockelloId}</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                {candidate.resumeUrl && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewResume(candidate.mockelloId);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    View Resume
                                  </button>
                                )}
                                <input
                                  type="checkbox"
                                  checked={selectedCandidatesForInvite.has(candidate.mockelloId)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleCandidateSelection(candidate.mockelloId);
                                  }}
                                  className="h-4 w-4 text-blue-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Schedule */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:border-[#BE185D]/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#BE185D]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Pending Interviews</h3>
                      <p className="text-gray-500 text-sm">View pending interview sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Pending</p>
                    <p className="text-2xl font-bold text-[#BE185D]">{pendingInterviews}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                  >
                    View Pending
                  </button>
                </div>
              </div>

              {/* Interview Sessions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:border-[#BE185D]/30 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#BE185D]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Interview Sessions</h3>
                      <p className="text-gray-500 text-sm">
                        {isLoadingSessions 
                          ? 'Loading sessions...' 
                          : `${sessions.length} sessions`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {renderSessions()}
                </div>
              </div>

              {/* Interview Results */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:border-[#BE185D]/30 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#BE185D]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Interview Results</h3>
                      <p className="text-gray-500 text-sm">
                        Completed interview results in tabular format
                      </p>
                    </div>
                  </div>
                </div>

                <InterviewResultsSection sessions={sessions} />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && <ScheduleModal />}

      </main>

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCandidate.fullName}</h2>
                    <p className="text-gray-600">{selectedCandidate.email}</p>
                  </div>
                  <button
                    onClick={() => setShowCandidateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Application Details</h3>
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Mockello ID</p>
                    <p className="font-medium">{selectedCandidate.mockelloId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Assigned Date</p>
                    <p className="font-medium">{new Date(selectedCandidate.assignedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-gray-700"
                      >
                        {index > 0 ? ' • ' : ''}{skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Required Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Required Skills</h2>
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Skill Type Selector */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => handleSkillTypeChange('technical')}
                    className={`px-4 py-2 rounded-lg ${
                      currentSkillType === 'technical'
                        ? 'bg-[#BE185D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Technical Skills
                  </button>
                  <button
                    onClick={() => handleSkillTypeChange('soft')}
                    className={`px-4 py-2 rounded-lg ${
                      currentSkillType === 'soft'
                        ? 'bg-[#BE185D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Soft Skills
                  </button>
                </div>

                {/* Current Skills Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentSkillType === 'technical' ? 'Technical' : 'Soft'} Skills Required
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill[currentSkillType]}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, [currentSkillType]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(currentSkillType)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#BE185D] focus:border-[#BE185D]"
                      placeholder={`Add a ${currentSkillType} skill`}
                    />
                    <button
                      onClick={() => handleAddSkill(currentSkillType)}
                      className="px-4 py-2 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(currentSkillType === 'technical' ? requiredSkills.technicalSkills : requiredSkills.softSkills).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#BE185D]/10 text-[#BE185D] rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(currentSkillType, skill)}
                          className="hover:text-[#BE185D]/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Recommendations Section */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Recommended skills:</span>
                      {isLoadingRecommendations && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#BE185D]/20 border-t-[#BE185D]"></div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillRecommendations.map((skill, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecommendationClick(skill, currentSkillType)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#BE185D]/10 hover:text-[#BE185D] transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                      {!isLoadingRecommendations && skillRecommendations.length === 0 && (
                        <span className="text-sm text-gray-500">
                          {currentSkillType === 'technical' 
                            ? 'Add a technical skill to see recommendations'
                            : 'Add a soft skill to see recommendations'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowSkillsModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvitations}
                    disabled={isSendingInvites}
                    className="px-4 py-2 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSendingInvites ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Invitations'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HRDashboard() {
  return (
    <ToastProvider>
      <HRDashboardInner />
    </ToastProvider>
  );
} 