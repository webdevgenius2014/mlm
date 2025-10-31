'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { userAPI } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';
import { Link2, Copy, Check, Users, Mail, Share2 } from 'lucide-react';

export default function ReferralPage() {
  const [referralData, setReferralData] = useState<any>(null);
  const [downline, setDownline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
    loadDownline();
  }, []);

  const loadReferralData = async () => {
    try {
      const response = await userAPI.getReferralLink();
      setReferralData(response.data);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDownline = async () => {
    try {
      const response = await userAPI.getDownline();
      setDownline(response.data);
    } catch (error) {
      console.error('Failed to load downline:', error);
    }
  };

  const handleCopyLink = async () => {
    if (referralData?.referralLink) {
      await copyToClipboard(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    if (referralData?.referralCode) {
      await copyToClipboard(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && referralData?.referralLink) {
      navigator.share({
        title: 'Join MLM Platform',
        text: 'Join me on this amazing MLM platform and start earning!',
        url: referralData.referralLink,
      });
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
          <h1 className="text-3xl font-bold text-gray-900">Referral</h1>
          <p className="text-gray-600 mt-1">Share your referral link and grow your network</p>
        </div>

        {/* Referral Link */}
        <Card title="Your Referral Link">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={referralData?.referralCode || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                />
                <Button onClick={handleCopyCode} variant="outline">
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={referralData?.referralLink || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button onClick={handleCopyLink} fullWidth>
                <Link2 className="h-5 w-5 mr-2" />
                Copy Link
              </Button>
              {navigator.share && (
                <Button onClick={handleShare} variant="outline" fullWidth>
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* How it Works */}
        <Card title="How Referral Works">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Share your unique referral link with friends and family
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. They Sign Up</h3>
              <p className="text-sm text-gray-600">
                When they register using your link, they join your network
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Earn Commissions</h3>
              <p className="text-sm text-gray-600">
                You earn $50 direct bonus + $100 when both positions are filled
              </p>
            </div>
          </div>
        </Card>

        {/* Direct Referrals */}
        <Card title="Direct Referrals" subtitle={`${downline.length} member${downline.length !== 1 ? 's' : ''}`}>
          {downline.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {downline.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No direct referrals yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Share your referral link to start building your network
              </p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
