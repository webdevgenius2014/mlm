import { Response } from 'express';
import { AuthRequest } from '../types';
import { binaryTreeService } from '../services/binaryTreeService';

export const getMyTree = async (req: AuthRequest, res: Response) => {
  try {
    const depth = parseInt(req.query.depth as string) || 5;
    const tree = await binaryTreeService.getTreeStructure(req.userId!, depth);

    res.json(tree);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTreeStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await binaryTreeService.getTreeStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
