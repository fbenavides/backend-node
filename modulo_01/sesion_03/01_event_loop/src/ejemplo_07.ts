setTimeout(() => {
  Promise.resolve().then(() => console.log('promise'));
  process.nextTick(() => console.log('nextTick'));
  console.log('timer');
}, 0);

setImmediate(() => console.log('immediate'));

console.log('----------------------');