import { findByUser } from "../repositories/user.repository.js";

export function getUserById(userId: number) {
  const userFound = findByUser(userId);

  if (!userFound) return null;
  if (process.env.NODE_ENV === 'development') {
    console.log('User:', userFound);
  }

  if (userFound.name === 'Fernando') {
    return 'Hola profe';
  } else {
    return 'Hola alumno!';
  }

}