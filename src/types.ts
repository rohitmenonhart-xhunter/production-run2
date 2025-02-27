export interface HR {
  _id: string;
  username: string;
  email: string;
  assignedCandidates?: string[];
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
  applications: {
    jobId: string;
    status: string;
    appliedAt: string;
  }[];
}

export interface HRSessionData {
  _id: string;
  username: string;
  email: string;
  sessionsCreated: number;
  maxSessions: number;
  lastUpdated: string;
  billingAmount: number;
}

export interface BillingInfo {
  totalCost: number;
  totalSessions: number;
  costPerSession: number;
}

export interface SessionStats {
  totalSessions: number;
  totalMaxSessions: number;
  hrs: HRSessionData[];
  billing: BillingInfo;
} 