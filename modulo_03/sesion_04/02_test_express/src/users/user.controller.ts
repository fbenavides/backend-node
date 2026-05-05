import { Request, Response } from 'express';
import { createUser, getUsers } from './user.service';

export async function createUserController(req: Request, res: Response) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json(user);
  } catch (error) {
    return res.status(409).json({
      message: (error as Error).message,
    });
  }
}

export async function getUsersController(_req: Request, res: Response) {
  const users = await getUsers();

  return res.json(users);
}