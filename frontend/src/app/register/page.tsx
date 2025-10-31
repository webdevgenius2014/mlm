'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api';
import { setAuthTokens } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  position?: 'LEFT' | 'RIGHT';
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setValue('referralCode', ref);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(data);
      const { accessToken, refreshToken, user } = response.data;

      setAuthTokens(accessToken, refreshToken, user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join MLM Platform</h1>
          <p className="text-gray-600 mt-2">Create your account and start earning</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
            />

            <Input
              label="Last Name"
              placeholder="Doe"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Phone (Optional)"
            type="tel"
            placeholder="+1 (555) 123-4567"
            {...register('phone')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Referral Information</h3>

            <Input
              label="Referral Code (Optional)"
              placeholder="MLM123456"
              {...register('referralCode')}
              error={errors.referralCode?.message}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Preference
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="LEFT"
                    {...register('position')}
                    className="mr-2"
                  />
                  <span className="text-sm">Left</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="RIGHT"
                    {...register('position')}
                    className="mr-2"
                  />
                  <span className="text-sm">Right</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value=""
                    defaultChecked
                    {...register('position')}
                    className="mr-2"
                  />
                  <span className="text-sm">Auto</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave as "Auto" to automatically place you in the best available position
              </p>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading} className="mt-6">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
