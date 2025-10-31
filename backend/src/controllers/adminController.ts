import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { transactionService } from '../services/transactionService';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    const total = await prisma.user.count();

    res.json({
      users: users.map((u) => ({
        ...u,
        balance: u.balance.toNumber(),
        totalEarnings: u.totalEarnings.toNumber(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' },
    });

    const totalEarningsResult = await prisma.user.aggregate({
      _sum: { totalEarnings: true },
    });

    const totalBalanceResult = await prisma.user.aggregate({
      _sum: { balance: true },
    });

    const pendingWithdrawals = await prisma.transaction.count({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING',
      },
    });

    const pendingWithdrawalAmount = await prisma.transaction.aggregate({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING',
      },
      _sum: { amount: true },
    });

    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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

    res.json({
      totalUsers,
      activeUsers,
      totalEarnings: totalEarningsResult._sum.totalEarnings?.toNumber() || 0,
      totalBalance: totalBalanceResult._sum.balance?.toNumber() || 0,
      pendingWithdrawals,
      pendingWithdrawalAmount: pendingWithdrawalAmount._sum.amount?.toNumber() || 0,
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
      })),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await prisma.transaction.findMany({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
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

    res.json(
      withdrawals.map((w) => ({
        ...w,
        amount: w.amount.toNumber(),
      }))
    );
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const approveWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const result = await transactionService.approveWithdrawal(transactionId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const result = await transactionService.rejectWithdrawal(transactionId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    res.json({
      message: 'User status updated',
      user,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
