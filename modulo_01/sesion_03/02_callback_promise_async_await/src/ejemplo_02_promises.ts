const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../file.txt');

function main() {
  fs.promises.readFile(filePath)
    .then((data) => {
      console.log(data.toString());
    })
    .catch((err) => {
      console.log('Error:', err.message);
    });
}

main();

export {};