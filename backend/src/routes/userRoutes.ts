import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateProfileValidation,
  getDashboard,
  getReferralLink,
  getDownline,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.get('/dashboard', getDashboard);
router.get('/referral-link', getReferralLink);
router.get('/downline', getDownline);

export default router;
