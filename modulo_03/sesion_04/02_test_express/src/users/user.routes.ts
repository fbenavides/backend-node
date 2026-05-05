import { Router } from 'express';
import {
  createUserController,
  getUsersController,
} from './user.controller';
import { createUserSchema } from './user.schema';
import { validate } from '../common/middlewares/validate.middleware';

const router = Router();

router.post('/users', validate(createUserSchema), createUserController);

router.get('/users', getUsersController);

export default router;