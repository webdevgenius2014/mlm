/**
 * Generate a unique referral code
 * Format: MLM + 6 random alphanumeric characters
 */
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'MLM';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

/**
 * Validate referral code format
 */
export const isValidReferralCode = (code: string): boolean => {
  return /^MLM[A-Z0-9]{6}$/.test(code);
};
