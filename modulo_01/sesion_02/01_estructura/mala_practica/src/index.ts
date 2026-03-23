import express from 'express';

const users = [
  { id: 1, name: 'Fernando', age: 30 },
  { id: 2, name: 'Carlos', age: 25 },
  { id: 3, name: 'Juan', age: 35 }
]

const app = express();
app.get('/api/user/:userId', (req, res) => {
  const user = Number(req.params.userId);
  const userFound = users.find(u => u.id === user);
  if (!userFound) {
    res.status(404).send('Usuario no encontrado');
    return;
  }

  if (userFound.name === 'Fernando') {
    res.status(200).send('Hola profe!');
  } else {
    res.status(200).send('Hola alumno!');
  }
});

app.listen(3000, () => console.log('Servidor iniciado en http://localhost:3000'));