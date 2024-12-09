const { calculateCRC16 } = require('./cash-register-cr16');
const net = require("net");
const iconv = require('iconv-lite');

class CashRegisterConnection {
  constructor(host = '192.168.1.111', port = 6666) {
    this.HOST = host;
    this.PORT = port;
    this.client = null;
    this.result = '';
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = new net.Socket();

      this.client.connect(this.PORT, this.HOST, () => {
        console.log("Connection established with cash register");
        resolve(this.client);
      });

      this.client.on('data', (data) => {
        const decodedData = iconv.decode(data, "win1250");
        console.log('Response (win1250):', decodedData);
        this.result = decodedData;
      });

      this.client.on('close', () => {
        console.log("Connection closed");
      });

      this.client.on('error', (err) => {
        console.error(`Error: ${err.message}`);
        reject(err);
      });
    });
  }

  sendToCashRegister(commands) {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('No active connection'));
        return;
      }

      const sendCommandSequence = (commandList) => {
        if (commandList.length === 0) {
          resolve(this.result);
          return;
        }

        const command = commandList[0];
        const crc16 = calculateCRC16(command);
        const fullCommand = `\x02${command}#${crc16}\x03`;
        const encodedCommand = iconv.encode(fullCommand, 'win1250');

        this.client.write(encodedCommand, (err) => {
          if (err) {
            reject(err);
            return;
          }

          console.log(`Command sent: ${encodedCommand}`);

          // Sending the next command after a small delay
          setTimeout(() => {
            sendCommandSequence(commandList.slice(1));
          }, 500);
        });
      };

      sendCommandSequence(commands);
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.destroy();
        this.client = null;
        resolve();
      } else {
        resolve();
      }
    });
  }
}

// // Usage example
// async function main() {
//   const commands = [
//     'prncancel\t',
//     'trinit\tbm1\t',
//     'trline\tnaBattery\tpr108\tvt1\t',
//     'trline\tnaLCD1\tpr200\tvt0\til2\t',
//     'trline\tnaLCD2\tpr100\tvt0\til1\t',
//     'trline\tnaDelivery\tpr200\tvt0\t',
//     'trend\tto808\t'
//   ];
//
//   const cashRegister = new CashRegisterConnection();
//
//   try {
//     await cashRegister.connect();
//     await cashRegister.sendToCashRegister(commands);
//     await cashRegister.disconnect();
//   } catch (error) {
//     console.error('Помилка:', error);
//   }
// }

module.exports = {
  CashRegisterConnection
};
