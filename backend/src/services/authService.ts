import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { generateReferralCode } from '../utils/referralCode';
import { RegisterInput, LoginInput } from '../types';
import { binaryTreeService } from './binaryTreeService';

class AuthService {
  async register(data: RegisterInput) {
    const { email, password, firstName, lastName, phone, referralCode, position } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate referral code if provided
    let upline = null;
    if (referralCode) {
      upline = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!upline) {
        throw new Error('Invalid referral code');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code for new user
    let newReferralCode = generateReferralCode();
    let codeExists = await prisma.user.findUnique({
      where: { referralCode: newReferralCode },
    });

    while (codeExists) {
      newReferralCode = generateReferralCode();
      codeExists = await prisma.user.findUnique({
        where: { referralCode: newReferralCode },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        referralCode: newReferralCode,
        uplineId: upline?.id,
      },
    });

    // Add to binary tree
    await binaryTreeService.addToBinaryTree(user.id, upline?.id, position);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode: user.referralCode,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode: user.referralCode,
        role: user.role,
        balance: user.balance,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
  }
}

export const authService = new AuthService();
