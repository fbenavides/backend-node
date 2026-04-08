# Docker

## Instalar docker

Descargar Docker Desktop
[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

## Ver imagenes

[https://hub.docker.com/](https://hub.docker.com/)

## Verificar instalación en terminal

```
docker --version
docker compose version
```

## Entrar a la carpeta 01_docker

```
cd modulo_02/sesion_01/01_docker
```

## Crear archivo .env

```
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=curso_backend
POSTGRES_PASSWORD=postgres
POSTGRES_DB=curso_backend
```

## Correr comando para crear contenedor en base a nuestro docker-compose.yml

```
docker compose up -d
```

## Verificar que está corriendo en la terminal

```
docker ps
```

## Luego de terminar la sesión, podemos parar los contenedores

```
docker compose down
```

---

## Ver nuestras bases de datos

Descargar DBeaver
[https://dbeaver.io/](https://dbeaver.io/)

Otras opciones:
- TablePlus [https://tableplus.com/](https://tableplus.com/)
- Beekeeper Studio [https://www.beekeeperstudio.io/](https://www.beekeeperstudio.io/)

## Conectarnos a bd mysql

Ingresar los siguientes valores:
- Host: localhost
- Port: 3306
- Database: curso_backend
- User: root
- Password: root

Si hay errores:

- Ir a la pestaña Driver Properties y cambiar las siguientes variables:
  - allowPublicKeyRetrieval = true
  - useSSL = false
  - sslMode = DISABLED



## Conectarnos a bd postgres

Ingresar los siguientes valores:
- Host: localhost
- Port: 5432
- Database: postgres_db
- User: postgres
- Password: postgres
