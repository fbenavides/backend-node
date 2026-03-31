const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '../archivo_grande.txt');

async function main() {

  let contador = 0;

  try {
    const data = await fs.readFile(filePath, 'utf-8');

    const lineas = data.split('\n');

    for (const linea of lineas) {
      if (linea.includes('Fernando Benavides')) {
        contador++;
      }
    }
  } catch (error: any) {
    console.error('Error leyendo archivo:', error.message);
  } finally {
    console.log('Total encontrados:', contador);
  }
}

main()

export {};