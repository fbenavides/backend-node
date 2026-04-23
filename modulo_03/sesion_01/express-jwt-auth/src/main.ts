import 'dotenv/config';
import { env } from './config/env';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});