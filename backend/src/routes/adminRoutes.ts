import { Router } from 'express';
import {
  getAllUsers,
  getSystemStats,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  updateUserStatus,
} from '../controllers/adminController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.get('/withdrawals/pending', getPendingWithdrawals);
router.post('/withdrawals/:transactionId/approve', approveWithdrawal);
router.post('/withdrawals/:transactionId/reject', rejectWithdrawal);
router.put('/users/:userId/status', updateUserStatus);

export default router;
