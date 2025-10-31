'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import { treeAPI } from '@/lib/api';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';

interface TreeNodeData {
  id: string;
  name: string;
  email: string;
  position: 'LEFT' | 'RIGHT' | null;
  leftChild: TreeNodeData | null;
  rightChild: TreeNodeData | null;
  leftLegCount: number;
  rightLegCount: number;
  joinedAt: string;
}

export default function TreePage() {
  const [tree, setTree] = useState<TreeNodeData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTree();
    loadStats();
  }, []);

  const loadTree = async () => {
    try {
      const response = await treeAPI.getMyTree(5);
      setTree(response.data);
    } catch (error) {
      console.error('Failed to load tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await treeAPI.getTreeStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const TreeNode = ({ node, level = 0 }: { node: TreeNodeData; level?: number }) => {
    const hasChildren = node.leftChild || node.rightChild;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div className={`ml-${level * 8}`}>
        <div
          className={`flex items-center space-x-2 p-3 rounded-lg mb-2 ${
            level === 0
              ? 'bg-primary-100 border-2 border-primary-300'
              : node.position === 'LEFT'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  level === 0
                    ? 'bg-primary-600'
                    : node.position === 'LEFT'
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                }`}
              >
                {node.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {node.name}
                  {level === 0 && <span className="ml-2 text-xs text-primary-600">(You)</span>}
                  {node.position && (
                    <span
                      className={`ml-2 text-xs ${
                        node.position === 'LEFT' ? 'text-blue-600' : 'text-green-600'
                      }`}
                    >
                      ({node.position})
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600">{node.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="text-center">
              <p className="text-gray-600">Left</p>
              <p className="font-semibold text-blue-600">{node.leftLegCount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Right</p>
              <p className="font-semibold text-green-600">{node.rightLegCount}</p>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-8 space-y-2">
            {node.leftChild && <TreeNode node={node.leftChild} level={level + 1} />}
            {node.rightChild && <TreeNode node={node.rightChild} level={level + 1} />}
          </div>
        )}
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Binary Tree</h1>
          <p className="text-gray-600 mt-1">View your network structure and downline</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Downline</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalDownline || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Left Leg</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.leftLegCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Right Leg</p>
                <p className="text-2xl font-bold text-green-600">{stats?.rightLegCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Tree Visualization */}
        <Card title="Network Structure">
          {tree ? (
            <div className="overflow-x-auto">
              <TreeNode node={tree} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Your tree is empty</p>
              <p className="text-sm text-gray-500 mt-1">
                Start referring people to build your network
              </p>
            </div>
          )}
        </Card>

        {/* Legend */}
        <Card title="Legend">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary-100 border-2 border-primary-300"></div>
              <span className="text-sm text-gray-700">You (Root)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200"></div>
              <span className="text-sm text-gray-700">Left Position</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 border border-green-200"></div>
              <span className="text-sm text-gray-700">Right Position</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
