import { Router } from 'express';
import { getMyTree, getTreeStats } from '../controllers/treeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/my-tree', getMyTree);
router.get('/stats', getTreeStats);

export default router;
