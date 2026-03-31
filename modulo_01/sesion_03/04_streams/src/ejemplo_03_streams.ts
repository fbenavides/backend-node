import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../archivo_grande.txt');

function main() {

  let contador = 0;
  let sobrante = '';

  const stream = fs.createReadStream(filePath, {
    encoding: 'utf-8',
  });

  stream.on('data', (chunk) => {
    console.log('Chunk recibido, tamaño:', chunk.length);

    const dataCompleta = sobrante + chunk;
    const lineas = dataCompleta.split('\n');

    sobrante = lineas.pop() || '';

    for (const linea of lineas) {
      if (linea.includes('Fernando Benavides')) {
        contador++;
      }
    }
  });

  stream.on('end', () => {
    if (sobrante.includes('Fernando Benavides')) {
      contador++;
    }

    console.log('Total encontrados:', contador);
  });

  stream.on('error', (error) => {
    console.error('Error leyendo archivo:', error.message);
  });
}

main();

export {};