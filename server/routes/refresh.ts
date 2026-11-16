import { Router } from 'express';
import { refreshCategory } from '../services/serp';
import { normalizeCategory } from '../../shared/categories';

const router = Router();

router.post('/refresh', async (req, res) => {
  try {
    const category = normalizeCategory(req.body?.category);

    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const summary = await refreshCategory(category);
    return res.status(200).json(summary);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;
