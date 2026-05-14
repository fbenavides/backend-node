# AGENTS.md

## Proyecto
Backend en Node.js + TypeScript usando NestJS.

## Comandos
- Instalar dependencias: `pnpm install`
- Desarrollo: `pnpm start:dev`
- Tests: `pnpm test`
- Lint: `pnpm lint`

## Estilo de código
- Usar TypeScript estricto.
- No usar `any` salvo que sea necesario.
- Usar nombres descriptivos.
- Separar controller, service, dto y repository.

## Arquitectura
- Los controllers solo reciben requests.
- La lógica de negocio va en services.
- Los DTOs validan entrada.
- No acceder directamente a la base de datos desde controllers.

## Testing
- Usar Jest.
- Seguir patrón AAA: Arrange, Act, Assert.
- Mockear dependencias externas.

## Seguridad
- No hardcodear credenciales.
- Usar variables de entorno.
- Validar inputs.
- No exponer stack traces al usuario final.