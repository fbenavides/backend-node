const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../file.txt');

function main() {
  fs.readFile(filePath, (err, data) => {
    if (err) console.log('Error: ', err.message);
    console.log(data.toString());
  });
}

main();

export {};