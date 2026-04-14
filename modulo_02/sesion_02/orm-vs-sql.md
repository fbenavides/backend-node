# ORM vs SQL (TypeORM vs MySQL)

<table style="width:100%; border-collapse: collapse;">
<tr>
<th>Caso</th>
<th>ORM (TypeORM)</th>
<th>SQL aproximado</th>
</tr>

<tr>
<td>Crear tabla simple</td>
<td><pre><code>@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}</code></pre></td>
<td><pre><code>CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);</code></pre></td>
</tr>

<tr>
<td>Crear tabla con default</td>
<td><pre><code>@Column({ default: true })
active: boolean;</code></pre></td>
<td><pre><code>active BOOLEAN NOT NULL DEFAULT true</code></pre></td>
</tr>

<tr>
<td>Insertar 1 registro</td>
<td><pre><code>const user = repo.create({
  name: 'Fer',
  email: 'fer@test.com'
});

await repo.save(user);</code></pre></td>
<td><pre><code>INSERT INTO users (name, email)
VALUES ('Fer', 'fer@test.com');</code></pre></td>
</tr>

<tr>
<td>Insertar varios</td>
<td><pre><code>await repo.save([
  { name: 'Ana', email: 'ana@test.com' },
  { name: 'Luis', email: 'luis@test.com' }
]);</code></pre></td>
<td><pre><code>INSERT INTO users (name, email)
VALUES
('Ana','ana@test.com'),
('Luis','luis@test.com');</code></pre></td>
</tr>

<tr>
<td>Obtener todos</td>
<td><pre><code>await repo.find();</code></pre></td>
<td><pre><code>SELECT * FROM users;</code></pre></td>
</tr>

<tr>
<td>Obtener por id</td>
<td><pre><code>await repo.findOne({
  where: { id: 1 }
});</code></pre></td>
<td><pre><code>SELECT * FROM users
WHERE id = 1
LIMIT 1;</code></pre></td>
</tr>

<tr>
<td>Filtrar por campo</td>
<td><pre><code>await repo.find({
  where: { active: true }
});</code></pre></td>
<td><pre><code>SELECT * FROM users
WHERE active = true;</code></pre></td>
</tr>

<tr>
<td>Filtrar y ordenar</td>
<td><pre><code>await repo.find({
  where: { active: true },
  order: { name: 'ASC' }
});</code></pre></td>
<td><pre><code>SELECT * FROM users
WHERE active = true
ORDER BY name ASC;</code></pre></td>
</tr>

<tr>
<td>Seleccionar columnas</td>
<td><pre><code>await repo.find({
  select: {
    id: true,
    name: true
  }
});</code></pre></td>
<td><pre><code>SELECT id, name
FROM users;</code></pre></td>
</tr>

<tr>
<td>Buscar varios ids</td>
<td><pre><code>await repo.findBy({
  id: In([1, 2, 3])
});</code></pre></td>
<td><pre><code>SELECT *
FROM users
WHERE id IN (1,2,3);</code></pre></td>
</tr>

<tr>
<td>Actualizar por id</td>
<td><pre><code>await repo.update(1, {
  name: 'Fernando'
});</code></pre></td>
<td><pre><code>UPDATE users
SET name = 'Fernando'
WHERE id = 1;</code></pre></td>
</tr>

<tr>
<td>Cargar, cambiar y guardar</td>
<td><pre><code>const user = await repo.findOne({
  where: { id: 1 }
});

user.name = 'Fernando';

await repo.save(user);</code></pre></td>
<td><pre><code>SELECT * FROM users
WHERE id = 1;

UPDATE users
SET name = 'Fernando'
WHERE id = 1;</code></pre></td>
</tr>

<tr>
<td>Borrar</td>
<td><pre><code>await repo.delete(1);</code></pre></td>
<td><pre><code>DELETE FROM users
WHERE id = 1;</code></pre></td>
</tr>

<tr>
<td>Contar</td>
<td><pre><code>await repo.count({
  where: { active: true }
});</code></pre></td>
<td><pre><code>SELECT COUNT(*)
FROM users
WHERE active = true;</code></pre></td>
</tr>

<tr>
<td>Relación 1:N</td>
<td><pre><code>await orderRepo.find({
  relations: {
    user: true
  }
});</code></pre></td>
<td><pre><code>SELECT o.*, u.*
FROM orders o
LEFT JOIN users u
  ON u.id = o.user_id;</code></pre></td>
</tr>

<tr>
<td>Join más complejo</td>
<td><pre><code>await dataSource
  .getRepository(User)
  .createQueryBuilder('u')
  .leftJoinAndSelect('u.orders', 'o')
  .where('u.active = :active', {
    active: true
  })
  .getMany();</code></pre></td>
<td><pre><code>SELECT u.*, o.*
FROM users u
LEFT JOIN orders o
  ON o.user_id = u.id
WHERE u.active = true;</code></pre></td>
</tr>

<tr>
<td>Transacción conceptual</td>
<td><pre><code>await dataSource.transaction(
  async (manager) => {
    // operaciones
  }
);</code></pre></td>
<td><pre><code>START TRANSACTION;
-- operaciones
COMMIT;</code></pre></td>
</tr>

</table>

---
