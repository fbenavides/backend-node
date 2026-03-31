const fs = require('fs');
const path = require('path');
const nodeCrypto = require('node:crypto');

const filePath = path.join(__dirname, '../file.txt');


console.log('1. Inicio');

setTimeout(() => console.log('2. setTimeout'), 0);

setImmediate(() => console.log('3. setImmediate'));

process.nextTick(() => console.log('4. nextTick'));

Promise.resolve().then(() => console.log('5. promise'));

fs.readFile(filePath, (err, data) => {
  if (err) throw err;

  console.log('6. readFile (poll)');

  setTimeout(() => console.log('7. timeout inside I/O'), 0);

  setImmediate(() => console.log('8. immediate inside I/O'));

  process.nextTick(() => console.log('9. nextTick inside I/O'));

  Promise.resolve().then(() => console.log('10. promise inside I/O'));
});

nodeCrypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512', (err: Error | null) => {
  if (err) throw err;
  console.log('11. pbkdf2 (thread pool)');
});

console.log('12. Fin');