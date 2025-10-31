import prisma from '../utils/prisma';
import { commissionService } from './commissionService';

class BinaryTreeService {
  /**
   * Add user to binary tree
   * Automatically finds the best position if position is not specified
   */
  async addToBinaryTree(
    userId: string,
    parentId?: string,
    preferredPosition?: 'LEFT' | 'RIGHT'
  ) {
    // If no parent, this is the root user
    if (!parentId) {
      await prisma.binaryTree.create({
        data: {
          userId,
          position: null,
        },
      });
      return;
    }

    // Get parent's binary tree node
    const parentNode = await prisma.binaryTree.findUnique({
      where: { userId: parentId },
    });

    if (!parentNode) {
      throw new Error('Parent not found in binary tree');
    }

    let position: 'LEFT' | 'RIGHT';

    // Determine position
    if (preferredPosition) {
      // Check if preferred position is available
      if (preferredPosition === 'LEFT' && !parentNode.leftChildId) {
        position = 'LEFT';
      } else if (preferredPosition === 'RIGHT' && !parentNode.rightChildId) {
        position = 'RIGHT';
      } else {
        // Preferred position taken, find any available position in the tree
        const availableParent = await this.findAvailablePosition(parentId);
        if (!availableParent) {
          throw new Error('No available position in the tree');
        }
        parentId = availableParent.parentId;
        position = availableParent.position;
      }
    } else {
      // Auto-assign to balance the tree (left first)
      if (!parentNode.leftChildId) {
        position = 'LEFT';
      } else if (!parentNode.rightChildId) {
        position = 'RIGHT';
      } else {
        // Both positions filled, find next available position in tree
        const availableParent = await this.findAvailablePosition(parentId);
        if (!availableParent) {
          throw new Error('No available position in the tree');
        }
        parentId = availableParent.parentId;
        position = availableParent.position;
      }
    }

    // Create binary tree node
    const newNode = await prisma.binaryTree.create({
      data: {
        userId,
        parentId,
        position,
      },
    });

    // Update parent node to link the child
    const updateData: any = {};
    if (position === 'LEFT') {
      updateData.leftChildId = userId;
    } else {
      updateData.rightChildId = userId;
    }

    await prisma.binaryTree.update({
      where: { userId: parentId },
      data: updateData,
    });

    // Update leg counts for all ancestors
    await this.updateAncestorLegCounts(parentId);

    // Check if parent is now eligible for matching bonus
    await this.checkMatchingBonus(parentId);

    return newNode;
  }

  /**
   * Find an available position in the tree using level-order traversal
   */
  async findAvailablePosition(
    rootId: string
  ): Promise<{ parentId: string; position: 'LEFT' | 'RIGHT' } | null> {
    const queue = [rootId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const node = await prisma.binaryTree.findUnique({
        where: { userId: currentId },
      });

      if (!node) continue;

      // Check if left position is available
      if (!node.leftChildId) {
        return { parentId: currentId, position: 'LEFT' };
      }

      // Check if right position is available
      if (!node.rightChildId) {
        return { parentId: currentId, position: 'RIGHT' };
      }

      // Add children to queue
      if (node.leftChildId) queue.push(node.leftChildId);
      if (node.rightChildId) queue.push(node.rightChildId);
    }

    return null;
  }

  /**
   * Update leg counts for all ancestors
   */
  async updateAncestorLegCounts(userId: string) {
    let currentNode = await prisma.binaryTree.findUnique({
      where: { userId },
    });

    while (currentNode?.parentId) {
      const parentNode = await prisma.binaryTree.findUnique({
        where: { userId: currentNode.parentId },
      });

      if (!parentNode) break;

      // Recalculate leg counts
      const leftCount = await this.countDescendants(parentNode.leftChildId);
      const rightCount = await this.countDescendants(parentNode.rightChildId);

      await prisma.binaryTree.update({
        where: { userId: currentNode.parentId },
        data: {
          leftLegCount: leftCount,
          rightLegCount: rightCount,
        },
      });

      currentNode = parentNode;
    }
  }

  /**
   * Count all descendants in a subtree
   */
  async countDescendants(userId: string | null): Promise<number> {
    if (!userId) return 0;

    const node = await prisma.binaryTree.findUnique({
      where: { userId },
    });

    if (!node) return 0;

    const leftCount = await this.countDescendants(node.leftChildId);
    const rightCount = await this.countDescendants(node.rightChildId);

    return 1 + leftCount + rightCount;
  }

  /**
   * Check if user is eligible for matching bonus
   * Criteria: At least 1 person on left AND 1 person on right
   */
  async checkMatchingBonus(userId: string) {
    const node = await prisma.binaryTree.findUnique({
      where: { userId },
    });

    if (!node) return;

    // Check if already paid
    if (node.matchingBonusPaid) return;

    // Check if both positions are filled
    if (node.leftChildId && node.rightChildId) {
      // Award matching bonus
      await commissionService.awardMatchingBonus(userId);

      // Mark as paid
      await prisma.binaryTree.update({
        where: { userId },
        data: { matchingBonusPaid: true },
      });
    }
  }

  /**
   * Get complete tree structure for a user
   */
  async getTreeStructure(userId: string, depth: number = 5) {
    const buildTree = async (
      nodeUserId: string,
      currentDepth: number
    ): Promise<any> => {
      if (currentDepth > depth) return null;

      const user = await prisma.user.findUnique({
        where: { id: nodeUserId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) return null;

      const treeNode = await prisma.binaryTree.findUnique({
        where: { userId: nodeUserId },
      });

      if (!treeNode) return null;

      const leftChild = treeNode.leftChildId
        ? await buildTree(treeNode.leftChildId, currentDepth + 1)
        : null;

      const rightChild = treeNode.rightChildId
        ? await buildTree(treeNode.rightChildId, currentDepth + 1)
        : null;

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        position: treeNode.position,
        leftChild,
        rightChild,
        leftLegCount: treeNode.leftLegCount,
        rightLegCount: treeNode.rightLegCount,
        joinedAt: user.createdAt,
      };
    };

    return buildTree(userId, 0);
  }

  /**
   * Get tree statistics for a user
   */
  async getTreeStats(userId: string) {
    const node = await prisma.binaryTree.findUnique({
      where: { userId },
    });

    if (!node) {
      return {
        leftLegCount: 0,
        rightLegCount: 0,
        totalDownline: 0,
        matchingBonusEligible: false,
      };
    }

    return {
      leftLegCount: node.leftLegCount,
      rightLegCount: node.rightLegCount,
      totalDownline: node.leftLegCount + node.rightLegCount,
      matchingBonusEligible: node.leftChildId && node.rightChildId && !node.matchingBonusPaid,
    };
  }
}

export const binaryTreeService = new BinaryTreeService();
