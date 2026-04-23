const fakeUsers = [
  {
    id: 1,
    name: 'Fernando',
    lastname: 'Benavides',
    email: 'fernando@edex.pe',
    password: '123456',
    role: 'user',
  },
];

export async function findUserById(id: number) {
  return fakeUsers.find((user) => user.id === id) || null;
}

export async function findUserByEmail(email: string) {
  return fakeUsers.find((user) => user.email === email) || null;
}