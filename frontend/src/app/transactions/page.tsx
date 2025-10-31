'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { transactionAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
} from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [commissionStats, setCommissionStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadCommissionStats();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommissionStats = async () => {
    try {
      const response = await transactionAPI.getCommissionStats();
      setCommissionStats(response.data);
    } catch (error) {
      console.error('Failed to load commission stats:', error);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError('');
    setWithdrawalSuccess('');

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount < 10) {
      setWithdrawalError('Minimum withdrawal amount is $10');
      return;
    }

    setSubmitting(true);

    try {
      await transactionAPI.requestWithdrawal(amount);
      setWithdrawalSuccess('Withdrawal request submitted successfully!');
      setWithdrawalAmount('');
      loadTransactions();
    } catch (error: any) {
      setWithdrawalError(
        error.response?.data?.error || 'Failed to submit withdrawal request'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'WITHDRAWAL':
        return <ArrowDownLeft className="h-5 w-5 text-red-600" />;
      case 'MATCHING_BONUS':
      case 'DIRECT_REFERRAL':
      case 'LEVEL_COMMISSION':
        return <ArrowUpRight className="h-5 w-5 text-green-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your earnings and withdrawals</p>
        </div>

        {/* Commission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commissionStats.map((stat) => (
            <Card key={stat.type}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {stat.type.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(stat.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.count} transactions</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
            </Card>
          ))}
        </div>

        {/* Withdrawal Form */}
        <Card title="Request Withdrawal">
          <form onSubmit={handleWithdrawal} className="space-y-4">
            {withdrawalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{withdrawalError}</p>
              </div>
            )}

            {withdrawalSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{withdrawalSuccess}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter amount (min $10)"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min="10"
                  step="0.01"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Processing...' : 'Withdraw'}
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Minimum withdrawal: $10. Your withdrawal will be processed within 1-3 business days.
            </p>
          </form>
        </Card>

        {/* Transaction History */}
        <Card title="Transaction History">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-full">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === 'WITHDRAWAL'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Your transaction history will appear here
              </p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
