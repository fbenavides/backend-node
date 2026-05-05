import {
  createUserController,
  getUsersController,
} from './user.controller';
import * as userService from './user.service';

jest.mock('./user.service');

describe('user.controller', () => {
  const mockedService = jest.mocked(userService);

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear usuario y responder 201', async () => {
    const req: any = {
      body: {
        name: 'Fernando',
        email: 'fernando@test.com',
        password: '123456',
      },
    };

    const res = mockResponse();

    const createdUser = {
      id: 1,
      ...req.body,
    };

    mockedService.createUser.mockResolvedValue(createdUser);

    await createUserController(req, res);

    expect(mockedService.createUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdUser);
  });

  it('debería responder 409 si el email ya existe', async () => {
    const req: any = {
      body: {
        name: 'Fernando',
        email: 'fernando@test.com',
        password: '123456',
      },
    };

    const res = mockResponse();

    mockedService.createUser.mockRejectedValue(
      new Error('Email already exists'),
    );

    await createUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email already exists',
    });
  });

  it('debería listar usuarios', async () => {
    const req: any = {};
    const res = mockResponse();

    const users = [
      {
        id: 1,
        name: 'Fernando',
        email: 'fernando@test.com',
        password: '123456',
      },
    ];

    mockedService.getUsers.mockResolvedValue(users);

    await getUsersController(req, res);

    expect(mockedService.getUsers).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(users);
  });
});