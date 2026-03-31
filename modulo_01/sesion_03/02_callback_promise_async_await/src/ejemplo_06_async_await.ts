const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const inputPath = path.join(__dirname, '../file.txt');
const outputPath = path.join(__dirname, '../output_async.txt');

// Helpers para convertir callbacks a promises
function randomBytesAsync(size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}

function scryptAsync(data, salt, keylen): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(data, salt, keylen, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

async function processFile() {
  try {
    // 1. Leer archivo
    const data = await fs.readFile(inputPath);
    const content = data.toString();

    // 2. Agregar fecha
    const withDate = content + '\nFecha: ' + new Date().toISOString();

    // 3. Generar salt
    const salt = await randomBytesAsync(16);

    // 4. Encriptar
    const hashed = await scryptAsync(withDate, salt, 32);
    const finalData = hashed.toString('hex');

    // 5. Escribir archivo
    await fs.writeFile(outputPath, finalData);
    console.log('Archivo escrito correctamente');

    // 6. Leer archivo final
    const newData = await fs.readFile(outputPath);
    console.log('Contenido final:', newData.toString());

    // 7. Obtener stats
    const stats = await fs.stat(outputPath);
    console.log('Tamaño del archivo:', stats.size, 'bytes');

  } catch (err: any) {
    console.log('Error:', err.message);
  }
}

processFile();

export {};