# Migraciones

## Migración manual

Entrar a la carpeta del proyecto nest 

```bash
cd /modulo_02/sesion_04/orders_example
```

### Crear datasource que se usará para las migraciones

Instalar dotenv para que el datasource pueda leer el .env

```bash
pnpm add dotenv -P
```

Crear el archivo `mysql-ormconfig.ts` en la carpeta `src/common/database`

```ts
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { OrderItem } from '../../order/order-item.entity';
import { Order } from '../../order/order.entity';
import { Product } from '../../product/product.entity';
import { User } from '../../user/user.entity';
import { Profile } from '../../profile/profile.entity';
import { Category } from '../../category/category.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [User, Order, OrderItem, Product, Profile, Category],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations_history',
  synchronize: false,
});
```


### Crear el archivo de migración

Correr el comando para crear la migración

```bash
npx typeorm migration:create src/migrations/CreateUsersTable
```

Ir al archivo creado en `src/migration/CreateUsersTable.ts` y editar el contenido con lo que queremos que ejecute la migración

Para el método `up`:

```ts
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
```

Para la función `down`:

```ts
  await queryRunner.query(`DROP TABLE usuarios;`);
```

### Ejecutar la migración

Agregar un script al archivo `package.json` para ejecutar la migración

```json
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
```

```bash
pnpm typeorm migration:run -d src/common/database/mysql-ormconfig.ts
```

### Revertir la migración

```bash
pnpm typeorm migration:revert -d src/common/database/mysql-ormconfig.ts
```

## Migración automática

### Crear archivo de migración

```bash
pnpm typeorm migration:generate -d src/common/database/mysql-ormconfig.ts src/migrations/InitSchema
```

### Ejecutar la migración

Agregar un script al archivo `package.json` para ejecutar la migración

```bash
pnpm typeorm migration:run -d src/common/database/mysql-ormconfig.ts
```

### Revertir la migración

```bash
pnpm typeorm migration:revert -d src/common/database/mysql-ormconfig.ts
```

#### Pequeño ejercicio

Crea campos en user entity:
- lastName
- email

Crea campo en product entity:
- description

Crea un indice en el campo name de category


Ejecuta la migración, generate y run

# Seeders

Crear carpeta `data` dentro de `src`

Crear archivo `products.seed.json`

Agregar el siguiente contenido:

```json
[
  {
    "name": "Smartphone Galaxy A34",
    "description": "Teléfono con cámara triple y pantalla AMOLED",
    "price": 999.99
  },
  {
    "name": "Laptop Lenovo ThinkPad",
    "description": "14'' FHD, 16GB RAM, 512GB SSD",
    "price": 2999.5
  }
]
```

Crear carpeta `seeders` dentro de `seeds` en `src`

Crear archivo `seed.products.ts` con el siguiente contenido:

```ts
import { AppDataSource } from '../common/database/mysql-ormconfig';
import { Product } from '../product/product.entity';
import * as fs from 'fs';

(async () => {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Product);

  const jsonData = fs.readFileSync('src/data/products.seed.json', 'utf-8');
  const products = JSON.parse(jsonData);

  for (const item of products) {
    const exists = await repo.findOneBy({ name: item.name });
    if (!exists) {
      await repo.save(repo.create(item));
      console.log(`Insertado: ${item.name}`);
    }
  }

  await AppDataSource.destroy();
})().catch((error) => {
  console.error('Error ejecutando seed:', error);
});
```

Ejecutamos el seeder

```bash
pnpm ts-node src/seeds/seed.products.ts
```

# Backups

Crear a carpeta `backups` dentro del proyecto
y entrar a la carpeta

```bash
cd backups
```

Correr `docker ps` para saber como se llama el contenedor de MySQL que queremos acceder

```bash
docker ps
```

## Sacar el backup

```bash
docker exec -e MYSQL_PWD=root mysql_db mysqldump -u root orders_example > backup-yyyy-MM-dd-HH-mm.sql
```

## Restaurar el backup

```bash
docker exec -i mysql_db mysql -u root -proot orders_example < backup-yyyy-MM-dd-HH-mm.sql 
```
# Monitoreo de queries lentos en MySQL

## Agregar a docker-compose.yml

```yaml
ports:
      - "3306:3306"
command:
  - --performance_schema=ON
  - --slow_query_log=1
  - --long_query_time=0.5
```

## Verificamos que se hayan aplicado las variables

```bash
docker exec -it mysql_db mysql -u root -proot -e "SHOW VARIABLES LIKE 'performance_schema'; SHOW VARIABLES LIKE 'slow_query_log'; SHOW VARIABLES LIKE 'long_query_time';"
```

## En Sql editor de DBeaver correr 

```sql
select sleep(1);
```

## Verificar el log de queries

```sql
SELECT DIGEST_TEXT, COUNT_STAR,
       SUM_TIMER_WAIT/1000000000 AS total_ms,
       AVG_TIMER_WAIT/1000000000 AS avg_ms,
       MAX_TIMER_WAIT/1000000000 AS max_ms
FROM performance_schema.events_statements_summary_by_digest
ORDER BY total_ms DESC
LIMIT 10;
```
