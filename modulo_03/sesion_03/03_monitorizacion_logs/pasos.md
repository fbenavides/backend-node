# Monitorización de logs con loki y grafana

## Levantamos nuestros contenedores docker

```bash
docker compose up -d
```

## Ingresamos a Grafana

`http://localhost:3000/`

Ingresamos el usuario `admin` y la contraseña `admin`

Nos pedirá que cambiemos la contraseña, la cambiamos e ingresamos

## Agregamos la conexión a loki

Ingresamos a Connections

En Add new connection buscamos loki

Entramos y presionamos `Add new data source`

En URL ponemos `http://loki:3100`

Presionamos `Save & Test`


## Copiamos el proyecto de la carpeta /modulo_03/sesion_03/01_manejo_errores_nestjs

Copiamos el proyecto del primer ejemplo para hacer las modificaciones ahí

## Entramos a la carpeta e instalamos dependencias

```bash
cd manejo-errores-nestjs
pnpm add -D pino-loki
```

## Cambiamos la configuración de pino en app.module.ts

```ts
  ...
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: {
          target: 'pino-loki',
          options: {
            host: 'http://localhost:3100',
            interval: 5,
            labels: { job: 'nestjs-app' },
          },
        },
      },
    }),
  ],
  ...
```

## Iniciamos el proyecto

```bash
pnpm start:dev
```

## Probamos que loki esté funcionando

En terminal correr

```bash
curl http://localhost:3100/ready
```

## Entramos a grafana 

Ingresamos a `http://localhost:3000/`

Entramos a la opción `Explore`

Seleccionamos `loki`

Agregar en query:

Para filtrar por job:
`{job="nestjs-app"}`

Para filtrar por texto:
{job="nestjs-app"} |= "abc234"

Para filtrar por todos los jobs
{job=~".+"}
