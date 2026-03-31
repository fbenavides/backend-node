const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../file.txt');

console.log('Inicio');

fs.readFile(filePath, (err, data) => {
  if (err) throw err;
  setTimeout(() => console.log('timeout 1'), 0);
  setImmediate(() => console.log('immediate'));
  setTimeout(() => console.log('timeout 2'), 0);
  console.log('readFile');
});

console.log('Fin');

export {};