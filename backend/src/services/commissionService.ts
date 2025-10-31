import prisma from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const MATCHING_BONUS_AMOUNT = parseFloat(process.env.MATCHING_BONUS_AMOUNT || '100');
const DIRECT_REFERRAL_BONUS = parseFloat(process.env.DIRECT_REFERRAL_BONUS || '50');

class CommissionService {
  /**
   * Award matching bonus when both left and right positions are filled
   */
  async awardMatchingBonus(userId: string) {
    const amount = new Decimal(MATCHING_BONUS_AMOUNT);

    // Create commission record
    await prisma.commission.create({
      data: {
        userId,
        type: 'MATCHING_BONUS',
        amount,
        paid: true,
        paidAt: new Date(),
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'MATCHING_BONUS',
        status: 'COMPLETED',
        amount,
        description: 'Matching bonus - Both positions filled',
        completedAt: new Date(),
      },
    });

    // Update user balance and total earnings
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: { increment: amount },
        totalEarnings: { increment: amount },
      },
    });

    console.log(`Matching bonus of $${MATCHING_BONUS_AMOUNT} awarded to user ${userId}`);
  }

  /**
   * Award direct referral bonus
   */
  async awardDirectReferralBonus(referrerId: string, newUserId: string) {
    const amount = new Decimal(DIRECT_REFERRAL_BONUS);

    // Create commission record
    await prisma.commission.create({
      data: {
        userId: referrerId,
        type: 'DIRECT_REFERRAL',
        amount,
        fromUserId: newUserId,
        level: 1,
        paid: true,
        paidAt: new Date(),
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: referrerId,
        type: 'DIRECT_REFERRAL',
        status: 'COMPLETED',
        amount,
        description: 'Direct referral bonus',
        fromUserId: newUserId,
        completedAt: new Date(),
      },
    });

    // Update user balance and total earnings
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        balance: { increment: amount },
        totalEarnings: { increment: amount },
      },
    });

    console.log(`Direct referral bonus of $${DIRECT_REFERRAL_BONUS} awarded to user ${referrerId}`);
  }

  /**
   * Award level commission (for future expansion)
   */
  async awardLevelCommission(
    userId: string,
    fromUserId: string,
    level: number,
    amount: number
  ) {
    const decimalAmount = new Decimal(amount);

    // Create commission record
    await prisma.commission.create({
      data: {
        userId,
        type: 'LEVEL_COMMISSION',
        amount: decimalAmount,
        fromUserId,
        level,
        paid: true,
        paidAt: new Date(),
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'LEVEL_COMMISSION',
        status: 'COMPLETED',
        amount: decimalAmount,
        description: `Level ${level} commission`,
        fromUserId,
        completedAt: new Date(),
      },
    });

    // Update user balance and total earnings
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: { increment: decimalAmount },
        totalEarnings: { increment: decimalAmount },
      },
    });
  }

  /**
   * Get commission history for a user
   */
  async getCommissionHistory(userId: string, limit: number = 50) {
    return await prisma.commission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get total commissions by type
   */
  async getCommissionStats(userId: string) {
    const commissions = await prisma.commission.groupBy({
      by: ['type'],
      where: { userId, paid: true },
      _sum: { amount: true },
      _count: { id: true },
    });

    return commissions.map((c) => ({
      type: c.type,
      totalAmount: c._sum.amount?.toNumber() || 0,
      count: c._count.id,
    }));
  }
}

export const commissionService = new CommissionService();
