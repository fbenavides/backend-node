console.log('Inicio');

setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

console.log('Fin');