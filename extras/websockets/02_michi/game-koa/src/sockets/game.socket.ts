import { Server, Socket } from 'socket.io';
import { rooms, socketRoom } from './game.store.js';
import {
  assignMarks,
  checkWinner,
  createRoomId,
  initRoom,
  publicState,
} from './game.logic.js';
import { Player } from './game.types.js';

export function registerGameSocket(io: Server) {
  io.on('connection', (socket) => {
    handleConnection(io, socket);

    socket.on('room:create', (payload) => {
      handleRoomCreate(io, socket, payload);
    });

    socket.on('room:join', (payload) => {
      handleRoomJoin(io, socket, payload);
    });

    socket.on('room:leave', () => {
      handleRoomLeave(io, socket);
    });

    socket.on('game:move', (payload) => {
      handleGameMove(io, socket, payload);
    });

    socket.on('disconnect', () => {
      handleDisconnect(io, socket);
    });
  });
}

function handleConnection(io: Server, socket: Socket) {
  console.log('Handle connection');
  socket.emit('hello', { message: 'welcome' });
}

function handleDisconnect(io: Server, socket: Socket) {
  console.log('Handle disconnect');
  leaveCurrentRoom(io, socket);
}

function handleRoomCreate(
  io: Server,
  socket: Socket,
  payload: { nickname?: string },
) {
  console.log('Handle room create');
  const nickname = normalizeNickname(payload?.nickname);

  const roomId = createRoomId();
  const room = initRoom(roomId);

  socket.join(roomId);
  socketRoom.set(socket.id, roomId);

  const player: Player = {
    socketId: socket.id,
    nickname,
    mark: null,
  };

  room.players.push(player);
  assignMarks(room);

  socket.emit('room:created', {
    roomId,
    mark: player.mark,
  });

  emitPlayers(io, roomId);
  socket.emit('game:state', publicState(room));
}

function handleRoomJoin(
  io: Server,
  socket: Socket,
  payload: { roomId?: string; nickname?: string },
) {
  console.log('Handle room join');
  const roomId = String(payload?.roomId || '').trim();
  const nickname = normalizeNickname(payload?.nickname);

  const room = rooms.get(roomId);

  if (!room) {
    socket.emit('room:error', { message: 'Room not found' });
    return;
  }

  if (room.players.length >= 2) {
    socket.emit('room:error', { message: 'Room is full' });
    return;
  }

  socket.join(roomId);
  socketRoom.set(socket.id, roomId);

  const player: Player = {
    socketId: socket.id,
    nickname,
    mark: null,
  };

  room.players.push(player);
  assignMarks(room);

  if (room.players.length === 2) {
    room.status = 'playing';
    room.turn = 'X';
  }

  socket.emit('room:joined', {
    roomId,
    mark: player.mark,
  });

  emitPlayers(io, roomId);
  io.to(roomId).emit('game:state', publicState(room));
}

function handleRoomLeave(io: Server, socket: Socket) {
  console.log('Handle room leave');
  leaveCurrentRoom(io, socket);
}

function handleGameMove(
  io: Server,
  socket: Socket,
  payload: { index?: number },
) {
  console.log('Handle game move');
  const roomId = socketRoom.get(socket.id);

  if (!roomId) {
    socket.emit('room:error', { message: 'Not in a room' });
    return;
  }

  const room = rooms.get(roomId);

  if (!room) {
    socket.emit('room:error', { message: 'Room missing' });
    return;
  }

  if (room.status !== 'playing') return;

  const player = room.players.find((p) => p.socketId === socket.id);

  if (!player?.mark) return;

  if (player.mark !== room.turn) {
    socket.emit('room:error', { message: 'Not your turn' });
    return;
  }

  const idx = Number(payload?.index);

  if (Number.isNaN(idx) || idx < 0 || idx > 8) return;

  if (room.board[idx]) return;

  room.board[idx] = player.mark;

  const result = checkWinner(room.board);

  if (result) {
    room.status = 'finished';
    room.winner = result;
  } else {
    room.turn = room.turn === 'X' ? 'O' : 'X';
  }

  io.to(roomId).emit('game:state', publicState(room));
}

function leaveCurrentRoom(io: Server, socket: Socket) {
  const roomId = socketRoom.get(socket.id);

  if (!roomId) return;

  const room = rooms.get(roomId);

  if (!room) return;

  socket.leave(roomId);
  socketRoom.delete(socket.id);

  room.players = room.players.filter((p) => p.socketId !== socket.id);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    io.to(roomId).emit('room:closed', { roomId });
    return;
  }

  room.status = 'waiting';
  room.winner = null;
  room.board = Array(9).fill(null);
  room.turn = 'X';

  emitPlayers(io, roomId);
  io.to(roomId).emit('game:state', publicState(room));
}

function emitPlayers(io: Server, roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  io.to(roomId).emit('room:players', {
    players: room.players.map((p) => ({
      nickname: p.nickname,
      mark: p.mark,
    })),
  });
}

function normalizeNickname(nickname?: string) {
  return (nickname || 'Player').slice(0, 20);
}