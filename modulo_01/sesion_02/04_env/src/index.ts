import dotenv from 'dotenv';
import express from 'express';
import { router } from './routes.js';
// import { env } from "./config/env.js"
dotenv.config()


const app = express();
app.use(express.json());

app.use("/api", router);

app.listen(process.env.PORT, () => console.log(`Servidor iniciado en ${process.env.PORT}`));
// app.listen(env.PORT, () => console.log(`Servidor iniciado en ${env.API_URL}`));
