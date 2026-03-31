import { findByUser } from "../repositories/user.repository.js";
import { emitter } from '../events/event-bus.js';

export function getUserById(userId: number) {

  emitter.emit('log', 'Hola mundo desde el servicio getUserById');

  const userFound = findByUser(userId);

  if (!userFound) return null;

  if (userFound.name === 'Fernando') {
    return 'Hola profe';
  } else {
    return 'Hola alumno!';
  }
  



}