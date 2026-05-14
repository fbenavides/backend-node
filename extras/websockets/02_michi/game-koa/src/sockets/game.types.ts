export type Mark = 'X' | 'O';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  socketId: string;
  nickname: string;
  mark: Mark | null;
}

export interface RoomState {
  id: string;
  players: Player[];
  board: (Mark | null)[];
  turn: Mark;
  status: GameStatus;
  winner: Mark | 'draw' | null;
}