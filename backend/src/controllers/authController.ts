import { Response } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/authService';
import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phone').optional().isMobilePhone('any'),
  body('referralCode').optional().isString(),
  body('position').optional().isIn(['LEFT', 'RIGHT']),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.register(req.body);

    res.status(201).json({
      message: 'Registration successful',
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await authService.login(req.body);

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    await authService.logout(refreshToken);

    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
