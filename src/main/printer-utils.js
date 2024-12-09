const { exec } = require('child_process');
// // Функція для отримання списку принтерів (тут вся інфа)
// const getPrinters = (callback) => {
//   exec('wmic printer get /format:csv', (error, stdout, stderr) => {
//     if (error) {
//       callback(error, null);
//       return;
//     }
//     if (stderr) {
//       callback(new Error(stderr), null);
//       return;
//     }
//
//     // Парсимо результат у масив об'єктів
//     const lines = stdout.split('\n').filter(line => line.trim() !== '');
//     const headers = lines[0].split(',');
//     const printers = lines.slice(1).map(line => {
//       const data = line.split(',');
//       const printer = {};
//       headers.forEach((header, index) => {
//         printer[header.trim()] = data[index].trim();
//       });
//       return printer;
//     });
//
//     callback(null, printers);
//   });
// };
// Функція для отримання списку принтерів (тільки Name і DeviceID)

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


module.exports = {
  getPrinters
};
