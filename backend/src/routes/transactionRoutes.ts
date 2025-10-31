import { Router } from 'express';
import {
  getTransactions,
  requestWithdrawal,
  withdrawalValidation,
  getWithdrawals,
  getCommissions,
  getCommissionStats,
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTransactions);
router.post('/withdraw', withdrawalValidation, requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.get('/commissions', getCommissions);
router.get('/commission-stats', getCommissionStats);

export default router;
