import express from 'express';
import { router } from './routes.js';

const app = express();
app.use(express.json());

app.use("/api", router);

app.listen(3000, () => console.log('Servidor iniciado en http://localhost:3000'));
