import { Mark, RoomState } from './game.types.js';
import { rooms } from './game.store.js';

export function createRoomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function initRoom(roomId: string): RoomState {
  const state: RoomState = {
    id: roomId,
    players: [],
    board: Array(9).fill(null),
    turn: 'X',
    status: 'waiting',
    winner: null,
  };

  rooms.set(roomId, state);

  return state;
}

export function assignMarks(room: RoomState) {
  if (room.players.length === 1) {
    room.players[0].mark = 'X';
  } else if (room.players.length === 2) {
    const taken = room.players.map((p) => p.mark);
    room.players[1].mark = taken.includes('X') ? 'O' : 'X';
  }
}

export function publicState(room: RoomState) {
  return {
    roomId: room.id,
    board: room.board,
    turn: room.turn,
    status: room.status,
    winner: room.winner,
    players: room.players.map((p) => ({
      nickname: p.nickname,
      mark: p.mark,
    })),
  };
}

export function checkWinner(board: (Mark | null)[]): Mark | 'draw' | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.every(Boolean) ? 'draw' : null;
}