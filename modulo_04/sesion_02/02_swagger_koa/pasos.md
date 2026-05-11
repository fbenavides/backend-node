# Swagger con Koa

## Estructura del proyecto

### Iniciamos proyecto e instalamos dependencias

```bash
pnpm init
pnpm add -P koa koa-router koa-bodyparser
pnpm add -P koa2-swagger-ui swagger-jsdoc
pnpm add -D typescript tsx @types/koa @types/koa-router @types/node
```

### Creamos el tsconfig.json

```bash
npx tsc --init
```

Pegamos este contenido en el tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Agregamos scripts de desarrollo

```json
scripts: {
  "dev": "tsx watch src/server.ts"
}
```

### Creamos el archivo src/types.ts

```ts
export interface Book { id: string; title: string; author: string; year: number; }
export interface CreateBook { title: string; author: string; year: number; }
export interface UpdateBook { title?: string; author?: string; year?: number; }
```

### Creamos el archivo `src/store.ts`

```ts
import { Book } from './types';
export const books: Book[] = [
    { id: '1', title: 'Clean Architecture', author: 'Robert C. Martin', year: 2017 },
    { id: '2', title: 'Refactoring', author: 'Martin Fowler', year: 2018 },
];
```

### Creamos el dummy auth `src/auth.ts`

```ts
import { Context, Next } from 'koa';

export async function authBearer(ctx: Context, next: Next) {
    const auth = ctx.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
        ctx.status = 401;
        ctx.body = { statusCode: 401, error: 'Unauthorized', message: 'Missing bearer token' };
        return;
    }
    const token = auth.substring('Bearer '.length).trim();
    if (token !== 'testtoken') {
        ctx.status = 401;
        ctx.body = { statusCode: 401, error: 'Unauthorized', message: 'Invalid token' };
        return;
    }
    await next();
}
```

### Creamos el archivo `src/routes/books.routes.ts`

```ts
import Router from 'koa-router';
import { books } from '../store';
import { Book, CreateBook, UpdateBook } from '../types';
import { Context } from 'koa';

const router = new Router({ prefix: '/books' });

/**
 * @openapi
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: List public books
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', (ctx: Context) => {
    ctx.body = books;
});

/**
 * @openapi
 * /api/books/admin:
 *   get:
 *     tags: [Books]
 *     summary: List private books (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK (private) }
 *       401: { description: Unauthorized }
 */
router.get('/admin', (ctx: Context) => {
    ctx.body = books;
});

/**
 * @openapi
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get book by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Found }
 *       404: { description: Not Found }
 */
router.get('/:id', (ctx: Context) => {
    const found = books.find(b => b.id === ctx.params.id);
    if (!found) {
        ctx.status = 404;
        ctx.body = { statusCode: 404, error: 'Not Found', message: 'Book not found' };
        return;
    }
    ctx.body = found;
});

/**
 * @openapi
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Create book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBook'
 *     responses:
 *       201: { description: Created }
 */
router.post('/', (ctx: Context) => {
    const body = ctx.request.body as CreateBook;
    const id = (books.length + 1).toString();
    const book: Book = { id, ...body };
    books.push(book);
    ctx.status = 201;
    ctx.body = book;
});

/**
 * @openapi
 * /api/books/{id}:
 *   patch:
 *     tags: [Books]
 *     summary: Update book
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBook'
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not Found }
 */
router.patch('/:id', (ctx: Context) => {
    const idx = books.findIndex(b => b.id === ctx.params.id);
    if (idx < 0) {
        ctx.status = 404;
        ctx.body = { statusCode: 404, error: 'Not Found', message: 'Book not found' };
        return;
    }
    const body = ctx.request.body as UpdateBook;
    books[idx] = { ...books[idx], ...body };
    ctx.body = books[idx];
});

/**
 * @openapi
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Delete book
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.delete('/:id', (ctx: Context) => {
    const idx = books.findIndex(b => b.id === ctx.params.id);
    if (idx < 0) {
        ctx.status = 404;
        ctx.body = { statusCode: 404, error: 'Not Found', message: 'Book not found' };
        return;
    }
    books.splice(idx, 1);
    ctx.status = 204;
});

export default router;
```

### Creamos el archivo `src/server.ts`

```ts
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { koaSwagger } from 'koa2-swagger-ui';
import swaggerJSDoc, { OAS3Definition, OAS3Options } from 'swagger-jsdoc';
import booksRoutes from './routes/books.routes';
import { authBearer } from './auth';

const app = new Koa();
const api = new Router({ prefix: '/api' });

app.use(bodyParser());

app.use(async (ctx, next) => {
    if (ctx.path === '/api/books/admin') {
        return authBearer(ctx, next);
    }
    return next();
});

api.use(booksRoutes.routes(), booksRoutes.allowedMethods());
app.use(api.routes()).use(api.allowedMethods());

// ----- OpenAPI (JSDoc) -----
const swaggerDefinition: OAS3Definition = {
    openapi: '3.0.0',
    info: {
        title: 'Books API (Koa)',
        version: '1.0.0',
        description: 'CRUD with mock data and Swagger (Koa)',
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            Book: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '1' },
                    title: { type: 'string', example: 'Clean Architecture' },
                    author: { type: 'string', example: 'Robert C. Martin' },
                    year: { type: 'integer', example: 2017 },
                },
                required: ['id', 'title', 'author', 'year'],
            },
            CreateBook: {
                type: 'object',
                properties: {
                    title: { type: 'string', example: 'Refactoring' },
                    author: { type: 'string', example: 'Martin Fowler' },
                    year: { type: 'integer', example: 2018 },
                },
                required: ['title', 'author', 'year'],
            },
            UpdateBook: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    author: { type: 'string' },
                    year: { type: 'integer' },
                },
            },
        },
    },
};

const swaggerOptions: OAS3Options = {
    definition: swaggerDefinition,
    apis: ['src/routes/**/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const docsRouter = new Router();
docsRouter.get('/swagger.json', (ctx) => { ctx.body = swaggerSpec; });
app.use(docsRouter.routes()).use(docsRouter.allowedMethods());

app.use(
    koaSwagger({
        routePrefix: '/docs',
        swaggerOptions: {
            url: '/swagger.json',
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    })
);

const port = 4000;
app.listen(port, () => {
    console.log(`Koa:  http://localhost:${port}`);
    console.log(`Docs: http://localhost:${port}/docs`);
});
```