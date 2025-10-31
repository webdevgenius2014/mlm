import prisma from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

class TransactionService {
  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    type?: string
  ) {
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const total = await prisma.transaction.count({ where });

    return {
      transactions: transactions.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(userId: string, amount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const decimalAmount = new Decimal(amount);

    if (user.balance.lessThan(decimalAmount)) {
      throw new Error('Insufficient balance');
    }

    // Minimum withdrawal check
    if (amount < 10) {
      throw new Error('Minimum withdrawal amount is $10');
    }

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        amount: decimalAmount,
        description: 'Withdrawal request',
      },
    });

    // Deduct from balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: { decrement: decimalAmount },
      },
    });

    return transaction;
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawals(userId: string) {
    const withdrawals = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'WITHDRAWAL',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return withdrawals.map((w) => ({
      ...w,
      amount: w.amount.toNumber(),
    }));
  }

  /**
   * Admin: Approve withdrawal
   */
  async approveWithdrawal(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.type !== 'WITHDRAWAL') {
      throw new Error('Not a withdrawal transaction');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Transaction already processed');
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { message: 'Withdrawal approved' };
  }

  /**
   * Admin: Reject withdrawal
   */
  async rejectWithdrawal(transactionId: string, reason?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.type !== 'WITHDRAWAL') {
      throw new Error('Not a withdrawal transaction');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Transaction already processed');
    }

    // Return money to user
    await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        balance: { increment: transaction.amount },
      },
    });

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'CANCELLED',
        description: reason || 'Withdrawal rejected',
        completedAt: new Date(),
      },
    });

    return { message: 'Withdrawal rejected' };
  }
}

export const transactionService = new TransactionService();
