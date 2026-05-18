# LLM con Koa

## Creamos nuestro token para usar gemini

Entramos a [https://aistudio.google.com/api-keys]

Crear API Key y copiarla en el archivo `.env`

## Estructura del proyecto

### Iniciamos proyecto e instalamos dependencias

```bash
pnpm init
pnpm add -P koa koa-router koa-bodyparser @google/genai dotenv
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
  "dev": "tsx watch src/main.ts"
}
```

### Crea el archivo `.env`

Agrega el api key generado en google studio

```txt
GEMINI_API_KEY=TU_API_KEY
```

### Crea el archivo `src/main.ts`

```ts
import 'dotenv/config'
import { app } from './app'

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`)
})
```

### Crea el archivo `src/app.ts`

```ts
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import chatRoutes from './routes/chat.routes'

const app = new Koa()

app.use(bodyParser())
app.use(chatRoutes.routes()).use(chatRoutes.allowedMethods())

export { app }
```

### Crea el archivo `src/routes/chat.routes.ts`

```ts
import Router from 'koa-router';
import { insertSale } from '../controllers/chat.controller';

const router = new Router();

router.post('/chat', insertSale);

export default router;
```

### Crea el archivo `src/controllers/chat.controller.ts`

```ts
import { Context } from 'koa'
import { insertSaleUsingLLM } from '../services/chat.service'

export const insertSale = async (ctx: Context) => {
  const body = ctx.request.body as { message?: string };

  if (!body.message) {
    ctx.status = 400;
    ctx.body = {
      ok: false,
      message: 'Debes enviar un mensaje.',
    };
    return;
  }

  const result = await insertSaleUsingLLM(body.message);

  ctx.body = {
    ok: result.status === 'ok',
    data: result,
  };
}
```

### Crea el archivo `src/services/chat.service.ts`

```ts
import { getCustomerAndProductId } from '../ai/ai.service';

const customers = [
  { id: 1, name: 'Fernando Benavides' },
  { id: 2, name: 'Fernando Torres' },
  { id: 3, name: 'Maria Lopez' },
  { id: 4, name: 'Carlos Ramirez' },
];

const products = [
  { id: 10, name: 'Laptop Lenovo', price: 3200 },
  { id: 11, name: 'Laptop HP', price: 2900 },
  { id: 12, name: 'Mouse Logitech', price: 80 },
  { id: 13, name: 'Teclado Redragon', price: 150 },
];

export const insertSaleUsingLLM = async (message: string) => {

  const response = await getCustomerAndProductId(customers, products, message);

  let result = JSON.parse(response.text ?? '{}');

  result.tokensUsed = response.usageMetadata.totalTokenCount;
  
  return result
}

/*
{
    "message": "Vendi un mouse a Carlos"
}

{
    "message": "Vendi una laptop a Fernando"
}

{
    "message": "Vendi una laptop hp a Fernando torre"
}

*/
```

### Crea el archivo `src/ai/ai.service.ts`

```ts
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getCustomerAndProductId = async (customers: any[], products: any[], message: string) => {

  const prompt = `
    Eres un asistente que ayuda a detectar ventas desde lenguaje natural.

    Tu tarea es analizar el mensaje del usuario y encontrar:
    - el cliente
    - el producto
    - si hay ambigüedad
    - si falta información

    IMPORTANTE:
    Solo puedes usar los clientes y productos de estas listas.

    Clientes disponibles:
    ${JSON.stringify(customers, null, 2)}

    Productos disponibles:
    ${JSON.stringify(products, null, 2)}

    Mensaje del usuario:
    "${message}"

    Reglas:
    1. Si detectas exactamente 1 cliente y 1 producto, responde status = "ok".
    2. Si hay más de un cliente posible, responde status = "need_clarification".
    3. Si hay más de un producto posible, responde status = "need_clarification".
    4. Si falta cliente o producto, responde status = "need_clarification".
    5. No inventes IDs.
    6. No inventes clientes.
    7. No inventes productos.
    8. Si hay ambigüedad, explica qué debe corregir el usuario.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: {
            type: Type.STRING,
            enum: ['ok', 'need_clarification'],
          },
          customerId: {
            type: Type.NUMBER,
            nullable: true,
          },
          productId: {
            type: Type.NUMBER,
            nullable: true,
          },
          message: {
            type: Type.STRING,
          },
        },
        required: ['status', 'customerId', 'productId', 'message'],
      },
    },
  });

  return response
}
```