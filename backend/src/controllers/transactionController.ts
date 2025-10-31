import { Response } from 'express';
import { AuthRequest } from '../types';
import { transactionService } from '../services/transactionService';
import { commissionService } from '../services/commissionService';
import { body, validationResult } from 'express-validator';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as string;

    const result = await transactionService.getTransactions(req.userId!, limit, offset, type);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const withdrawalValidation = [
  body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal amount is $10'),
];

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const transaction = await transactionService.requestWithdrawal(req.userId!, amount);

    res.json({
      message: 'Withdrawal request submitted',
      transaction: {
        ...transaction,
        amount: transaction.amount.toNumber(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await transactionService.getWithdrawals(req.userId!);
    res.json(withdrawals);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommissions = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const commissions = await commissionService.getCommissionHistory(req.userId!, limit);

    res.json(
      commissions.map((c) => ({
        ...c,
        amount: c.amount.toNumber(),
      }))
    );
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommissionStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await commissionService.getCommissionStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
