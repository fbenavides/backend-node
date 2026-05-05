import { CreateUserDto } from './user.schema';
import { findAllUsers, findOneByEmail, saveUser } from './user.dao';

export async function createUser(data: CreateUserDto) {
  const existingUser = await findOneByEmail(data.email);

  if (existingUser) {
    throw new Error('Email already exists');
  }

  return saveUser(data);
}

export async function getUsers() {
  return findAllUsers();
}