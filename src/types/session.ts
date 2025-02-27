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