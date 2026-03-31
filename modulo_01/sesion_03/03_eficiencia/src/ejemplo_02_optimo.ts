const fs = require('fs/promises');
const path = require('path');

process.on('unhandledRejection', (err) => {
  console.error('Promesa no manejada:', err);
});

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function leerArchivo(nombreArchivo) {
  const filePath = path.join(process.cwd(), nombreArchivo);
  await delay(1000);
  const contenido = await fs.readFile(filePath, 'utf-8');
  console.log(`Archivo ${nombreArchivo} leído`);
  return contenido;
}

async function main() {
  console.time('Tiempo total');
  try {
    const archivos = ['a.txt', 'b.txt', 'c.txt'];

    const resultados = await Promise.all(
      archivos.map(leerArchivo)
    );

    console.log('Todos los archivos leídos correctamente');
    console.log(resultados);
    console.timeEnd('Tiempo total');
  } catch (error: any) {
    console.error('Error leyendo archivos:', error.message);
  }
}

main();

export {};