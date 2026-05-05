import { createUser, getUsers } from './user.service';
import * as userDao from './user.dao';

jest.mock('./user.dao');

describe('user.service', () => {
  const mockedDao = jest.mocked(userDao);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear usuario si el email no existe', async () => {
    const input = {
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    };

    const savedUser = {
      id: 1,
      ...input,
    };

    mockedDao.findOneByEmail.mockResolvedValue(null);
    mockedDao.saveUser.mockResolvedValue(savedUser);

    const result = await createUser(input);

    expect(result).toEqual(savedUser);
    expect(mockedDao.findOneByEmail).toHaveBeenCalledWith(input.email);
    expect(mockedDao.saveUser).toHaveBeenCalledWith(input);
  });

  it('debería lanzar error si el email ya existe', async () => {
    const input = {
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    };

    mockedDao.findOneByEmail.mockResolvedValue({
      id: 1,
      ...input,
    });

    await expect(createUser(input)).rejects.toThrow('Email already exists');

    expect(mockedDao.saveUser).not.toHaveBeenCalled();
  });

  it('debería listar usuarios', async () => {
    const users = [
      {
        id: 1,
        name: 'Fernando',
        email: 'fernando@test.com',
        password: '123456',
      },
    ];

    mockedDao.findAllUsers.mockResolvedValue(users);

    const result = await getUsers();

    expect(result).toEqual(users);
    expect(mockedDao.findAllUsers).toHaveBeenCalled();
  });
});