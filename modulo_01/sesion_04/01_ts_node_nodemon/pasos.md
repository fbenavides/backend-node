
# Uso de ts node y nodemon

## Empezar el proyecto

```
pnpm init
```

## Agregar dependencias para ejemplo

```
pnpm add express -P
pnpm add -D typescript @types/express
```

## Agregar `"type": "module"` a package.json


## Agregar el tsconfig.json

```
tsc --init
```

Reemplazar el contenido del archivo `tsconfig.json` por:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "ts-node": {
    "esm": true
  }
}
```


## Crear carpeta `src`

```
mkdir src
```

## Crear archivo `src/main.ts`

```ts
import express from 'express';

const app = express();

app.get('/', (req: any, res: any) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Servidor iniciado en puerto 3000');
});
```

---

## Instalar ts-node

```
pnpm add -D ts-node
```

## Ejecutar el proyecto

Ya podemos ejecutar directamente

```
ts-node src/main.ts
```

en lugar de 

```
tsc
node dist/main.js
```

---

## Instalar nodemon

```
pnpm add -D nodemon
```

## Ejecutar el proyecto con nodemon

```
npx nodemon --watch src --ext ts --exec "ts-node src/main.ts"
```

## Podemos agregarlo en package.json como script

```json
"scripts": {
  "dev": "npx nodemon --watch src --ext ts --exec \"ts-node src/main.ts\""
},
```

## Podemos definir los parámetros de nodemon en un archivo `nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/main.ts"
}
```

y ahora solo tendriamos que ejecutar

```
npx nodemon
```