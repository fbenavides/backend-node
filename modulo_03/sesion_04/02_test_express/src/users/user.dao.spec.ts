import {
  findAllUsers,
  findOneByEmail,
  resetUsersForTest,
  saveUser,
} from './user.dao';

describe('user.dao', () => {
  beforeEach(() => {
    resetUsersForTest();
  });

  it('debería guardar un usuario', async () => {
    const user = await saveUser({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    expect(user).toEqual({
      id: 1,
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });
  });

  it('debería buscar un usuario por email', async () => {
    await saveUser({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    const user = await findOneByEmail('fernando@test.com');

    expect(user?.email).toBe('fernando@test.com');
  });

  it('debería retornar null si no encuentra el email', async () => {
    const user = await findOneByEmail('noexiste@test.com');

    expect(user).toBeNull();
  });

  it('debería listar usuarios', async () => {
    await saveUser({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    const users = await findAllUsers();

    expect(users).toHaveLength(1);
  });
});