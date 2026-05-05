import { CreateUserDto } from './user.schema';

export type User = CreateUserDto & {
  id: number;
};

let users: User[] = [];
let nextId = 1;

export async function findOneByEmail(email: string): Promise<User | null> {
  return users.find((user) => user.email === email) ?? null;
}

export async function saveUser(data: CreateUserDto): Promise<User> {
  const user = {
    id: nextId++,
    ...data,
  };

  users.push(user);

  return user;
}

export async function findAllUsers(): Promise<User[]> {
  return [...users];
}

export function resetUsersForTest() {
  users = [];
  nextId = 1;
}