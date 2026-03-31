import fs from 'fs';
import path from 'path';
import { once } from 'events';

const TOTAL = 2 * 1000000;
// const TOTAL = 30 * 1000000;
    
const filePath = path.join(__dirname, '../archivo_grande.txt');

const nombres = [
  'Fernando', 'Luis', 'Carlos', 'Ana', 'María', 'Lucía',
  'Jorge', 'Pedro', 'Camila', 'Valeria', 'Diego', 'Sofía'
];

const apellidos = [
  'Benavides', 'García', 'Pérez', 'Torres', 'Ramírez',
  'Flores', 'Castro', 'Vargas', 'Rojas', 'Mendoza'
];

const ciudades = ['Lima', 'Arequipa', 'Cusco', 'Piura', 'Trujillo'];

function randomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generarLinea(i: number) {
  return `${i},${randomItem(nombres)} ${randomItem(apellidos)},${Math.floor(Math.random() * 60) + 18},${randomItem(ciudades)},${Math.random().toFixed(5)}\n`;
}

async function main() {
  try {

    const stream = fs.createWriteStream(filePath, {
      encoding: 'utf-8',
    });


    for (let i = 0; i < TOTAL; i++) {
      const ok = stream.write(generarLinea(i));

      if (i % 1000000 === 0) {
        console.log(`Procesadas ${i} líneas...`);
      }

      if (!ok) {
        await once(stream, 'drain');
      }
    }

    stream.end();
    await once(stream, 'finish');

    console.log('Archivo generado en:', filePath);

  } catch (error) {
    console.error('Error generando archivo:', error);
  }
}

main();

export {};