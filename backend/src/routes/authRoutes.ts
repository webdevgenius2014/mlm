import { Router } from 'express';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  logout,
} from '../controllers/authController';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);

export default router;
