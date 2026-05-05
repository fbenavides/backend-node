import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('email is invalid'),
  password: z.string().min(6, 'password must have at least 6 characters'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;