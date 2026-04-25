import { Router } from 'express';
import { refreshCategory } from '../services/serp';

const router = Router();

const VALID_CATEGORIES = ['CPU', 'GPU', 'RAM', 'Motherboard', 'PSU', 'Cabinet', 'SSD'];

router.post('/refresh', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const summary = await refreshCategory(category);
    return res.status(200).json(summary);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;
