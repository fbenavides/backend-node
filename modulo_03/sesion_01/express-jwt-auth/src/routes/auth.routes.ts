import { Router } from 'express';
import {
  loginHandler,
  loginSecureHandler,
  logoutHandler,
  refreshTokenHandler,
  refreshTokenSecureHandler,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginHandler);
router.post('/login-secure', loginSecureHandler);
router.post('/refresh-token', refreshTokenHandler);
router.post('/refresh-token-secure', refreshTokenSecureHandler);
router.post('/logout', logoutHandler);

export default router;