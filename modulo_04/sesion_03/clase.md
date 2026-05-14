# 📌 Sesión 03 – Módulo 04 Uso de herramientas IA para el desarrollo de software


### 📅 Duración: 1h 30 min
###  🎯 Objetivo: Al finalizar esta clase, el estudiante podrá:

- Entender qué rol cumplen herramientas como ChatGPT, Copilot, Cursor y Claude dentro del flujo de desarrollo moderno.
- Diferenciar entre usar IA de forma básica y usar IA con contexto técnico bien definido.
- Crear prompts técnicos efectivos para generar código más útil, claro y alineado al proyecto.
- Usar archivos de contexto como AGENTS.md para mejorar la calidad de las respuestas de la IA dentro de un proyecto.
- Aplicar IA para analizar errores, stack traces y problemas comunes de configuración.
- Usar IA para generar documentación técnica como README, comentarios, explicación de código y documentación de endpoints.
- Reconocer los límites de la IA: alucinaciones, código inseguro, dependencias inventadas y respuestas que deben verificarse.
- Integrar la IA en un flujo profesional de trabajo sin perder criterio técnico ni control del código.

## 1. Introducción a la IA aplicada al desarrollo

¿Por qué la IA está cambiando el desarrollo?

### Evolución del desarrollo

#### Antes:

* StackOverflow
* Google
* Documentación oficial
* Tutoriales
* Prueba y error

#### Ahora:

* Conversación iterativa con IA
* Generación de código en tiempo real
* Explicación automática de errores
* Refactorización asistida
* Testing y documentación automática

## 2. La IA como asistente técnico

### La IA puede actuar como:

* Pair programmer
* Reviewer
* Generador de boilerplate
* Asistente de debugging
* Tutor técnico
* Generador de documentación

### Qué puede hacer bien la IA

* Explicar conceptos técnicos
* Generar estructuras base
* Detectar errores comunes
* Crear tests
* Refactorizar código
* Generar documentación

### Qué NO debe hacer sola

* Tomar decisiones críticas de arquitectura
* Validar seguridad automáticamente
* Reemplazar criterio técnico
* Garantizar código correcto

### Ejemplos

#### a. Aprendizaje técnico

```txt
Explícame Redis comparándolo con PostgreSQL 
para un backend Node.js.
```

```txt
Hazme un cuadro comparativo entre MySQL y PostgreSQL 
para un backend Node.js
```

```txt
Explicame si es mejor usar NestJS o Koa para un 
microservicio backend Node.js que solo tendrá las rutas 
para authorización con JWT. 
```


### b. Explicación de errores

```txt
Explicame como solucionar este error:
[PEGAR STACK TRACE]
```

### c. Explicación de código legacy

```txt
Explicame este archivo línea por línea
```

### d. Generación de arquitectura

```txt
Ayudame con una arquitectura de microservicios para un backend Node.js 
que solo tendrá las rutas para authorización con JWT. Usando Fastify
```

### e. Refactorización

```txt
Refactoriza este código usando clean code y TypeScript estricto.
[Pegar código de una función larga]
```

### f. Generación de boilerplate

```txt
Genera un CRUD usando Express + TypeScript + Repository Pattern.
```

### g. Generación de documentación

```txt
Documenta el user.controller.ts usando swagger 
```

### h. Generación de tests

```txt
Genera pruebas unitarias Jest siguiendo patrón AAA.
Usa mocks.
Explica qué valida cada test.
```

## 3. Herramientas de IA para desarrollo

### a. ChatGPT / Gemini / Claude

#### Usos principales

* Explicaciones técnicas
* Arquitectura
* Debugging
* Refactorización
* Testing
* Documentación

#### Ventajas

* Excelente razonamiento
* Conversación iterativa
* Explicaciones detalladas

#### Inconvenientes

* Puede olvidar contexto en conversaciones largas
* A veces inventa APIs
* No siempre conoce estructura completa del proyecto
* Puede generar demasiado texto innecesario
* No está integrado directamente al IDE


### b. GitHub Copilot / Supermaven

#### Características

* Autocompletado inteligente
* Integración con VS Code
* Generación rápida de código

#### Casos ideales

* Boilerplate
* Métodos repetitivos
* DTOs
* Mappers
* CRUDs simples

#### Inconvenientes

* A veces autocompleta mal código convincente
* Tiene poco contexto del negocio
* Repite patrones incorrectos
* Puede inducir copy/paste automático
* Malo explicando arquitectura

### c. Cursor / Antigravity / Windsurf

#### Características

* Editor orientado completamente a IA
* Entiende contexto del proyecto
* Modificación masiva de archivos
* Chat contextual

#### Casos ideales

* Refactors grandes
* Análisis de proyecto
* Cambios multiarchivo

#### Inconvenientes

* Riesgo de aceptar cambios masivos sin revisar
* Refactorización demasiado agresivo
* Pueden romper arquitectura sin darse cuenta
* Alto consumo de tokens
* Dificultad auditando cambios grandes

### d. Claude Code / Codex

#### Características

* Gran ventana de contexto
* Excelente para archivos largos
* Bueno explicando código complejo

#### Casos ideales

* Revisar proyectos completos
* Analizar documentación extensa
* Explicar código legado

## 4. Prompting técnico orientado a generación de código

### Prompt engineering

Estructurar correctamente las instruccciones (Prompts) para obtener mejores resultados.

#### Caso 1:

❌ Mala práctica:
```txt
Haz login JWT
```

✅ Buena práctica:
```txt
Estoy usando NestJS + TypeScript.

Necesito autenticación JWT con:
- access token
- refresh token
- cookies httpOnly

No usar base de datos real.

Quiero:
- controller
- service
- strategy
- tests
```

#### Caso 2:

❌ Mala práctica:
```txt
No funciona TypeORM
```

✅ Buena práctica:
```txt
Tengo un proyecto NestJS + TypeORM.

Al correr migraciones aparece:
[paste error]

Este es mi tsconfig:
[paste]

Estoy usando ESM.
Qué está pasando y cómo lo soluciono.
```

#### Caso 3:

❌ Mala práctica:
```txt
Haz tests
```

✅ Buena práctica:
```txt
Genera pruebas unitarias Jest para este UserService.

Usa:
- mocks
- patrón AAA
- edge cases

Explica qué valida cada test.
```

### Estructura de un buen prompt

#### a. Contexto

Qué proyecto estás desarrollando.

❌ Mala práctica:
```txt
Haz autenticación
```

✅ Buena práctica:
```txt
Estoy desarrollando un ecommerce backend para múltiples tiendas usando NestJS.
Cada tienda tiene usuarios administradores y vendedores.
Necesito implementar autenticación JWT.
```

#### b. Stack tecnológico

Frameworks y herramientas usadas.

❌ Mala práctica:
```txt
Haz un CRUD
```

✅ Buena práctica:
```txt
Estoy usando:
- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- pnpm

Genera un CRUD de productos.
```

#### c. Objetivo

Qué necesitas exactamente.

❌ Mala práctica:
```txt
Haz login de usuarios
```

✅ Buena práctica:
```txt
Necesito permitir que los usuarios:
- se registren
- inicien sesión
- refresquen tokens
- cierren sesión
```

#### d. Restricciones

Qué NO quieres.

❌ Mala práctica:
```txt
[No poner nada]
```

✅ Buena práctica:
```txt
Restricciones:
- No usar MongoDB
- No usar any
- No usar librerías externas de validación
- No usar arquitectura hexagonal
```

#### e. Formato esperado

Cómo debe responder la IA.

❌ Mala práctica:
```txt
[No poner nada]
```

✅ Buena práctica:
```txt
Quiero:
- Estructura de carpetas
- Código completo
- Explicación línea por línea
- Tests Jest
- Ejemplos de requests HTTP
```

## 5. Contexto persistente y archivos AGENTS.md

### ¿Qué es AGENTS.md?

Es un archivo que define:

* Reglas del proyecto
* Arquitectura
* Convenciones
* Comandos
* Buenas prácticas

La IA lo utiliza como contexto permanente.

### Objetivo

Evitar repetir constantemente:

* Tecnologías
* Estructura
* Convenciones
* Reglas de negocio

### Ejemplo de agents.md

```txt
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
```

Tip:
```txt
Usa la IA para mejorar el prompt que has escrito
```


## 6. Riesgos y limitaciones de la IA

### Alucinaciones

La IA puede inventar:

* APIs
* Librerías
* Métodos
* Configuraciones

### Falsa sensación de seguridad

El código:

* Puede compilar
* puede verse profesional
* PERO estar mal diseñado

### Dependencia excesiva

Problema grave:

* Developers que dejan de razonar
* Copy/paste sin validar
* Pérdida de fundamentos


### Riesgos reales

* Código inseguro
* SQL incorrecto
* Mala arquitectura
* Dependencias inexistentes
* Configuraciones inválidas

###  Buenas prácticas

* Validar siempre el código
* Leer documentación oficial
* Ejecutar pruebas
* Revisar seguridad
* No copiar/pegar ciegamente

## 7. Flujo moderno de desarrollo con IA


#### a. Diseñar

Usar IA para brainstorming y arquitectura.

#### b. Generar

Usar IA para boilerplate y estructuras base.

#### c. Refinar

Refactorizar y mejorar.

#### d. Validar

Probar y revisar manualmente.

#### e. Documentar

Generar documentación y explicaciones.

## 8. Resumen y buenas prácticas

* La IA es un acelerador técnico, no un reemplazo del developer.
* Los mejores resultados vienen de prompts claros y específicos.
* Herramientas como Cursor y Copilot funcionan mejor con contexto.
* AGENTS.md ayuda a mantener consistencia en proyectos grandes.
* La IA es excelente para debugging, documentación y testing base.
* Siempre validar seguridad, arquitectura y lógica crítica.
* La productividad moderna depende tanto del criterio técnico 
como del uso correcto de IA.

