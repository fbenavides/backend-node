# 📌 Sesión 04 – Integración de LLMs en Backend


### 📅 Duración: 1h 30 min
###  🎯 Objetivo: Al finalizar esta clase, el estudiante podrá:

- Entender qué es un LLM y cómo funciona a alto nivel.
- Diferenciar los principales proveedores y modelos del mercado.
- Aprender cómo autenticarse y consumir APIs de modelos de lenguaje.
- Implementar una integración básica desde Node.js/TypeScript.
- Entender conceptos de tokens, costos y contexto.
- Reconocer casos reales donde los LLMs agregan valor en productos modernos.
- Comprender cómo abstraer múltiples proveedores desde una misma arquitectura backend.

## 1. Qué es una LLM?

Un LLM es un modelo entrenado para procesar y generar lenguaje natural. No “piensa” como una persona: predice la siguiente respuesta más probable según el contexto que recibe.
Se comporta como un autcompletado con contexto enorme.


## 2. Tipos de modelos y servicios

| Tipo | Ejemplos | Características |
|------|----------|-----------------|
| Modelos cerrados | Claude, GPT, ChatGPT | Los consumes por API, pagas por uso o usas free tier |
| Modelos abiertos | Llama, Mistral, Gemma | Puedes usarlos mediante proveedores o correrlos tú mismo |
| Proveedores de inferencia | Groq, Together, Fireworks, Replicate | No crean necesariamente el modelo, pero te dan API para usarlo |
| Locales | Ollama, LM Studio | Corren en tu máquina o servidor |

## 3. Cuánto cuesta consumir un LLM?

La unidad de medida de los LLMs es el token.
Los tokens son fragmentos de texto, puede ser una palabra completa, parte de una palabra, un signo de puntuación, o incluso un espacio.

| Texto | Tokens aproximados | Notas |
|---|---|---|
| "Hola mundo" | 3 | Hola,  mundo |
| "Hello world" | 2 | El inglés suele tokenizar más eficientemente |
| "unforgettable" | 4 | un, for, get, table |
| "Fernando" | 3 | Fer, nan, do |
| 1000 líneas de código | ~750 tokens | El código es compacto |

Como regla práctica: 1 token ≈ 4 caracteres en inglés, o unas 3/4 partes de una palabra. En español el ratio es ligeramente peor.

### ¿Por qué importa en el backend?
Porque el costo de cada llamada depende directamente de los tokens consumidos, separados en dos tipos:

`Input tokens:` todo lo que envías al modelo (system prompt + historial + datos del usuario).
`Output tokens:` lo que el modelo genera como respuesta.

El output suele costar entre 3x y 5x más que el input


| Proveedor | Modelo | Input (1M tokens) | Output (1M tokens) | Context Window | Comentarios |
|---|---|---|---|---|---|
| OpenAI | GPT-4o Mini | $0.15 | $0.60 | 128K | Muy barato para chatbots |
| OpenAI | GPT-4o | $2.50 | $10.00 | 128K | Muy buen balance calidad/costo |
| OpenAI | GPT-4.1 | $2.00 | $8.00 | 1M | Excelente para código |
| Anthropic | Claude Haiku | $1.00 | $5.00 | 200K | Muy rápido |
| Anthropic | Claude Sonnet | $3.00 | $15.00 | 200K - 1M | Muy usado en coding |
| Anthropic | Claude Opus | $5.00 | $25.00 | 1M | Muy potente pero caro |
| Google | Gemini Flash Lite | $0.10 | $0.40 | 1M | Muy económico |
| Google | Gemini Flash | $0.30 | $2.50 | 1M | Muy buena velocidad |
| Google | Gemini Pro | $1.25 | $10.00 | 1M - 2M | Excelente contexto largo |
| Groq | Llama 3 / Scout | $0.11 | $0.34 | 128K+ | Rapidísimo |
| DeepSeek | DeepSeek V4 Flash | $0.14 | $0.28 | 1M | Extremadamente barato |
| Mistral | Mistral Large | $2.00 | $6.00 | 128K | Bueno para Europa/privacy |

## 4. Casos de uso

### a. Chatbots inteligentes

### b. Resumen o lectura de documentos

### c. Extracción de datos estructurados

```txt
Vendí una laptop Lenovo a Fernando por 3200 soles ayer.
```

```json
{
  "cliente": "Fernando",
  "producto": "Laptop Lenovo",
  "monto": 3200,
  "fecha": "ayer",
  "tipo": "venta"
}
```

### d. Clasificación automática

### e. Búsqueda inteligente (generación de sql)

```txt
“Muéstrame las ventas grandes del mes pasado”
```

### f. Moderación automática

### g. Asistentes internos para empresas

## 5. Estructura en un proyecto

```txt
src/
  ai/
    ai.controller.ts
    ai.service.ts
    providers/
      openai.provider.ts
      gemini.provider.ts
      groq.provider.ts
      claude.provider.ts
    dto/
      generate-text.dto.ts
```

## 6. Ejemplos de código

### OpenAI

```bash
pnpm add openai
```

```ts
import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: 'Explica qué es un backend en una frase sencilla.',
  });

  console.log(response.output_text);
}

main();
```

### Anthropic

```bash
pnpm add @anthropic-ai/sdk
```

```ts
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: 'Explica qué es un backend en una frase sencilla.',
      },
    ],
  });

  const text = response.content[0];

  if (text.type === 'text') {
    console.log(text.text);
  }

}

main();
```

### Google

```bash
pnpm add @google/genai
```

```ts
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Explica qué es un backend en una frase sencilla.',
  });

  console.log(response.text);
}

main();
```

### Groq

```bash
pnpm add groq-sdk
```

```ts
import 'dotenv/config';
import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: 'Explica qué es un backend en una frase sencilla.',
      },
    ],
  });

  console.log(response.choices[0]?.message?.content);
}

main();
```

### DeepSeek

```bash
pnpm add openai
```

```ts
import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

async function main() {
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'user',
        content: 'Explica qué es un backend en una frase sencilla.',
      },
    ],
  });

  console.log(response.choices[0]?.message?.content);
}

main();
```

## 7. Recomendaciones

### a. Usa distintos modelos según el problema
  No todas las tareas necesitan el modelo más caro.

### b. Minimiza el contexto enviado
  Enviar solo la información necesaria.

### c. No delegues toda la lógica al LLM
  La IA interpreta lenguaje, el backend debe: validar, ejecutar reglas, consultar base de datos, manejar permisos, controlar transacciones.

### d. Usa respuestas estructuradas (JSON)
  Evita respuestas libres cuando el backend necesita procesar datos.

### e. Nunca expongas API keys en frontend
  Las credenciales deben mantenerse en backend.

### f. Implementa límites y monitoreo
  Ten tus tokens usados bajo control.

### g. Diseña una capa de abstracción
  No acoplarse a un único proveedor.

### h. Usa IA donde realmente agrega valor
  Lenguaje natural, clasificación, resúmenes, asistentes, etc.