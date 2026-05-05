// src/main.ts
import express from 'express';
import userRoutes from './users/user.routes';

const app = express();

app.use(express.json());
app.use(userRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});