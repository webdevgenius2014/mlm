import { Response } from 'express';
import { AuthRequest } from '../types';
import { userService } from '../services/userService';
import { body, validationResult } from 'express-validator';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userService.getProfile(req.userId!);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProfileValidation = [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().isMobilePhone('any'),
];

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profile = await userService.updateProfile(req.userId!, req.body);

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await userService.getDashboardStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getReferralLink = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userService.getProfile(req.userId!);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referralLink = userService.getReferralLink(profile.referralCode, baseUrl);

    res.json({
      referralCode: profile.referralCode,
      referralLink,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getDownline = async (req: AuthRequest, res: Response) => {
  try {
    const downline = await userService.getDownline(req.userId!);
    res.json(downline);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
