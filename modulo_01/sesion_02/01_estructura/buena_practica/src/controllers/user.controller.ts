import { getUserById } from "../services/user.service.js";

export async function getUser(req: any, res: any) {
  const userId = Number(req.params.userId);
  const response = getUserById(userId);

  if (!response) {
    res.status(404).send('Usuario no encontrado');
    return;
  }

  res.status(200).send(response);
}