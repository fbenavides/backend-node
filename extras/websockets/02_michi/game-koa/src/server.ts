import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createHealthRouter } from './routes/health.routes.js';
import { registerGameSocket } from './sockets/game.socket.js';

const app = new Koa();

app.use(bodyParser());

const healthRouter = createHealthRouter();

app.use(healthRouter.routes());
app.use(healthRouter.allowedMethods());

const httpServer = createServer(app.callback());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

registerGameSocket(io);

const PORT = Number(process.env.PORT || 3000);

httpServer.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log(`Socket.IO server running on ws://localhost:${PORT}`);
});