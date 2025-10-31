import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  referralCode?: string;
  position?: 'LEFT' | 'RIGHT';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface DashboardStats {
  totalEarnings: number;
  balance: number;
  totalDownline: number;
  leftLegCount: number;
  rightLegCount: number;
  directReferrals: number;
  recentTransactions: any[];
  matchingBonusEligible: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  email: string;
  position: 'LEFT' | 'RIGHT' | null;
  leftChild: TreeNode | null;
  rightChild: TreeNode | null;
  leftLegCount: number;
  rightLegCount: number;
  joinedAt: Date;
}
