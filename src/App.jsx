import React, { useEffect, useState } from 'react';
import RouterComponent from "./Router.jsx";

export default function App() {

    useEffect(() => {
      // Функція для початку підключення до WebSocket
      const startWebSocketClient = () => {
        const ws = new WebSocket('ws://37.27.179.208:8765');

        ws.onopen = () => {
          console.info('Connected to WebSocket!');
          ws.send('СлаваУкраине!'); // Відправляємо повідомлення на сервер
        };

        ws.onmessage = async (event) => {
          console.info('Received a message from the server: ' + event.data);
          console.log(event)
        };

        ws.onclose = () => {
          console.warn('WebSocket closed. Trying to reconnect in 5 seconds...');
          setTimeout(startWebSocketClient, 5000); // Автоматичне підключення через 5 секунд
        };

        ws.onerror = (error) => {
          console.error('WebSocket error: ' + error.message);
          ws.close(1000, 'Normal closure');
        };
      };

      startWebSocketClient();

      return () => {
        ws.close();
      };
    }, []);

  return (
    <>
      <div>log</div>
      <RouterComponent />
    </>
  );
}
