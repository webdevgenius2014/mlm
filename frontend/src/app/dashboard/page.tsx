'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import { userAPI } from '@/lib/api';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import {
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await userAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(stats?.balance || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Downline',
      value: stats?.totalDownline || 0,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Direct Referrals',
      value: stats?.directReferrals || 0,
      icon: Activity,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your performance overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Binary Tree Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Binary Tree Statistics">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Left Leg Count</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.leftLegCount || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Right Leg Count</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.rightLegCount || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>

              {stats?.matchingBonusEligible && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">
                    🎉 You're eligible for the Matching Bonus!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Both your left and right positions have members.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Recent Transactions">
            <div className="space-y-3">
              {stats?.recentTransactions?.length > 0 ? (
                stats.recentTransactions.slice(0, 5).map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'WITHDRAWAL'
                            ? 'bg-red-100'
                            : 'bg-green-100'
                        }`}
                      >
                        {transaction.type === 'WITHDRAWAL' ? (
                          <ArrowDownLeft className="h-4 w-4 text-red-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === 'WITHDRAWAL'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No transactions yet
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* MLM Terms */}
        <Card title="MLM Commission Structure">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Matching Bonus</h4>
              <p className="text-2xl font-bold text-green-600 mb-1">$100</p>
              <p className="text-sm text-green-700">
                When both left and right positions have at least 1 person
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Direct Referral</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">$50</p>
              <p className="text-sm text-blue-700">
                Earn for each person you directly refer
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Binary Tree</h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">Unlimited</p>
              <p className="text-sm text-purple-700">
                Grow your network with left and right placements
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
