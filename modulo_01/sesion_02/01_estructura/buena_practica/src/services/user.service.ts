import { findByUser } from "../repositories/user.repository.js";

export function getUserById(userId: number) {
  const userFound = findByUser(userId);

  if (!userFound) return null;

  if (userFound.name === 'Fernando') {
    return 'Hola profe';
  } else {
    return 'Hola alumno!';
  }

}