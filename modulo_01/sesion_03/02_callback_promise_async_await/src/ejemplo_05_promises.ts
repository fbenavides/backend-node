const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const inputPath = path.join(__dirname, '../file.txt');
const outputPath = path.join(__dirname, '../output_promise.txt');

// Helpers para convertir callbacks a promises
function randomBytesAsync(size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}

function scryptAsync(data, salt, keylen) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(data, salt, keylen, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

fs.readFile(inputPath)
  .then((data) => {
    const content = data.toString();
    return content + '\nFecha: ' + new Date().toISOString();
  })
  .then((withDate) => {
    return randomBytesAsync(16).then((salt) => ({ withDate, salt }));
  })
  .then(({ withDate, salt }) => {
    return scryptAsync(withDate, salt, 32);
  })
  .then((hashed) => {
    const finalData = hashed.toString('hex');
    return fs.writeFile(outputPath, finalData).then(() => finalData);
  })
  .then(() => {
    console.log('Archivo escrito correctamente');
    return fs.readFile(outputPath);
  })
  .then((newData) => {
    console.log('Contenido final:', newData.toString());
    return fs.stat(outputPath);
  })
  .then((stats) => {
    console.log('Tamaño del archivo:', stats.size, 'bytes');
  })
  .catch((err) => {
    console.log('Error:', err.message);
  });

export {};