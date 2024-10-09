import React, { useEffect, useState } from 'react';
import RouterComponent from "./Router.jsx";

export default function App() {
  const [online, setOnline] = useState(true)

  const handlePrint = async (pdfUrl) => {
    // Викликаємо IPC метод для завантаження і друку PDF файлу
    try {
      await window.ipcRenderer.downloadAndPrintPDF(pdfUrl, "Factura Printer");
    } catch (e) {
      console.log(e)
    }
  };

  useEffect(() => {
    // Функція для початку підключення до WebSocket
    const startWebSocketClient = () => {
      const ws = new WebSocket('ws://37.27.179.208:8765');

      ws.onopen = () => {
        console.info('Connected to WebSocket!');
        ws.send('СлаваУкраине!');
        setOnline(true)
      };

      ws.onmessage = async (event) => {
        console.info('Received a message from the server: ' + event.data);
        console.log(event)
        if (event.data.includes('.pdf')) {
          // Якщо прийшло посилання на PDF файл, відправляємо запит на його друк
          handlePrint(event.data);
        }
      };

      ws.onclose = () => {
        console.warn('WebSocket closed. Trying to reconnect in 5 seconds...');
        setOnline(false)
        setTimeout(startWebSocketClient, 5000); // Автоматичне підключення через 5 секунд
      };

      ws.onerror = (error) => {
        console.error('WebSocket error: ' + error.message);
        setOnline(false)
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
      <div className="flex absolute top-0 left-0 right-0 items-center justify-between p-6">
        <div className="px-4 py-2 rounded-md shadow-2xl bg-[#232325]">
          <h1 className="text-white flexible-text-10">Sh.</h1>
        </div>
        <span className={`px-4 py-2 text-white rounded-lg ${online ? "bg-green-600" : "bg-red-600"}`}>{online ? "Online" : "Offline"}</span>
      </div>
      <RouterComponent/>
    </>
  );
}
