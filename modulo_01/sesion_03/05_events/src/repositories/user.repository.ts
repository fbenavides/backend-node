const users = [
  { id: 1, name: 'Fernando', age: 30 },
  { id: 2, name: 'Carlos', age: 25 },
  { id: 3, name: 'Juan', age: 35 }
]

export function findByUser(userId: number) {
  return users.find(u => u.id === userId);
}