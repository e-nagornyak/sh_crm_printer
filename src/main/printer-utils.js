const { exec } = require('child_process');
const { getPrinters: getAllPrinters } = require('pdf-to-printer');

const getPrinters = () => {
  return new Promise((resolve, reject) => {
    exec('wmic printer get Name,DeviceID /format:csv', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(stderr));
        return;
      }

      // Парсимо результат у масив об'єктів
      const lines = stdout.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');
      const printers = lines.slice(1).map(line => {
        const data = line.split(',');
        return {
          Name: data[0].trim(),
          DeviceID: data[1].trim(),
        };
      });

      resolve(printers);
    });
  });
};

const getPrintersNew = () => {
  return new Promise((resolve, reject) => {
    try {
      getAllPrinters()
        .then(printers => {
          resolve(printers);
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getPrinters,
  getPrintersNew
};
