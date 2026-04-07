
# Debugger

## En la terminal entrar a la carpeta 02_debugger

```
cd ..
cd 02_debugger
```

## Copiar los archivos trabajados en el ejemplo anterior

- src
- package.json
- tsconfig.json
- nodemon.json

## Instalar dependencias

```
pnpm install
```

## Agregar script en tsconfig.json

```
"sourceMap": true
```

## En visual code, entrar a Run y seleccionar "Add configuration" y seleccionar "Node.js"

## En el archivo launch.json, cambiar la configuración por:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug con nodemon + ts-node",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/modulo_01/sesion_04/02_debugger",
      "runtimeExecutable": "npx",
      "runtimeArgs": [
        "nodemon",
        "--watch",
        "src",
        "--ext",
        "ts",
        "--exec",
        "ts-node src/main.ts"
      ],
      "console": "integratedTerminal",
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## En visual code, entrar a Run y seleccionar "Start debugging"

