import express from 'express';
import { router } from './routes.js';
import { emitter } from './events/event-bus.js';

emitter.on('log', (data: string) => {
  console.log('Evento recibido:', data);
});

const app = express();
app.use(express.json());

app.use("/api", router);

app.listen(3000, () => console.log('Servidor iniciado en http://localhost:3000'));

emitter.emit('log', 'Hola mundo desde el servidor');
