const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const inputPath = path.join(__dirname, '../file.txt');
const outputPath = path.join(__dirname, '../output_callback.txt');

fs.readFile(inputPath, (err, data) => {
  if (err) {
    console.log('Error leyendo archivo:', err.message);
    return;
  }

  const content = data.toString();
  const withDate = content + '\nFecha: ' + new Date().toISOString();

  crypto.randomBytes(16, (err, salt) => {
    if (err) {
      console.log('Error generando salt:', err.message);
      return;
    }

    crypto.scrypt(withDate, salt, 32, (err, hashed) => {
      if (err) {
        console.log('Error encriptando:', err.message);
        return;
      }

      const finalData = hashed.toString('hex');

      fs.writeFile(outputPath, finalData, (err) => {
        if (err) {
          console.log('Error escribiendo archivo:', err.message);
          return;
        }

        console.log('Archivo escrito correctamente');

        fs.readFile(outputPath, (err, newData) => {
          if (err) {
            console.log('Error leyendo archivo final:', err.message);
            return;
          }

          console.log('Contenido final:', newData.toString());

          fs.stat(outputPath, (err, stats) => {
            if (err) {
              console.log('Error obteniendo stats:', err.message);
              return;
            }

            console.log('Tamaño del archivo:', stats.size, 'bytes');
          });
        });
      });
    });
  });
});

export {};