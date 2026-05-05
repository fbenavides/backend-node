import { createUserSchema } from './user.schema';

describe('createUserSchema', () => {
  it('debería validar un usuario correcto', () => {
    const result = createUserSchema.safeParse({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('debería fallar si el email es inválido', () => {
    const result = createUserSchema.safeParse({
      name: 'Fernando',
      email: 'correo-malo',
      password: '123456',
    });

    expect(result.success).toBe(false);
  });

  it('debería fallar si el password es muy corto', () => {
    const result = createUserSchema.safeParse({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123',
    });

    expect(result.success).toBe(false);
  });
});