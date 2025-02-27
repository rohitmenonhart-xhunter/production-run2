export interface HR {
  _id: string;
  name: string;
  email: string;
  username: string;
  companyId: string;
  companyEmail: string;
  createdAt: string;
  assignedCandidates?: string[];
  sessionsCreated?: number;
  maxSessions?: number;
  lastUpdated?: string;
}

export interface Candidate {
  _id: string;
  mockelloId: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  skills: string[];
  experience: any[];
  education: any[];
  projects?: any[];
  achievements?: any[];
  appliedRole: string;
  applications: Array<{
    jobId: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
    matchScore: number;
    qualified: boolean;
  }>;
}

export interface SessionStats {
  totalSessions: number;
  totalMaxSessions: number;
  hrs: Array<{
    _id: string;
    username: string;
    email: string;
    sessionsCreated: number;
    maxSessions: number;
    lastUpdated: string;
  }>;
} 