const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '../file.txt');

async function main() {
  try {
    const data = await fs.readFile(filePath);
    console.log(data.toString());
  } catch (err: any) {
    console.log('Error:', err.message);
  }
}

main();

export {};