import prisma from '../utils/prisma';
import { binaryTreeService } from './binaryTreeService';
import { DashboardStats } from '../types';

class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        referralCode: true,
        balance: true,
        totalEarnings: true,
        status: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        referralCode: true,
      },
    });

    return user;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalEarnings: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get tree stats
    const treeStats = await binaryTreeService.getTreeStats(userId);

    // Get direct referrals count
    const directReferrals = await prisma.user.count({
      where: { uplineId: userId },
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
      },
    });

    return {
      totalEarnings: user.totalEarnings.toNumber(),
      balance: user.balance.toNumber(),
      totalDownline: treeStats.totalDownline,
      leftLegCount: treeStats.leftLegCount,
      rightLegCount: treeStats.rightLegCount,
      directReferrals,
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
      })),
      matchingBonusEligible: treeStats.matchingBonusEligible,
    };
  }

  /**
   * Get referral link
   */
  getReferralLink(referralCode: string, baseUrl: string = 'http://localhost:3000') {
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  /**
   * Get downline members
   */
  async getDownline(userId: string) {
    const downline = await prisma.user.findMany({
      where: { uplineId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        referralCode: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return downline;
  }
}

export const userService = new UserService();
