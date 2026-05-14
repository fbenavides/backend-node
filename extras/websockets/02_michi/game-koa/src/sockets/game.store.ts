import { RoomState } from './game.types.js';

export const rooms = new Map<string, RoomState>();

export const socketRoom = new Map<string, string>();