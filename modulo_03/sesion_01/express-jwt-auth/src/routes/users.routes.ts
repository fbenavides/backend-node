import { Router } from 'express';
import { getProfile } from '../controllers/users.controller';
import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware';

const router = Router();

router.get('/profile', jwtAuthMiddleware, getProfile);

export default router;