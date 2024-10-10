import React, { useEffect, useState } from 'react';
import RouterComponent from "./Router.jsx";
import useAppState from "./hooks/AppState.js";

export default function App() {
  const { state, setState } = useAppState();
  const [error, setError] = useState('')

  let ws = null;

  const handlePrint = async (pdfUrl) => {
    // Викликаємо IPC метод для завантаження і друку PDF файлу
    try {
      await window.ipcRenderer.downloadAndPrintPDF(pdfUrl, "Factura Printer");
    } catch (e) {
      console.log(e)
    }
  };

  const startWebSocketClient = async () => {
    try {
      // Отримуємо конфіг із токеном
      const baseConfig = await window.configAPI.getConfig();
      const token = baseConfig?.token; // Передбачаючи, що токен зберігається у конфігу

      if (!token) {
        setError('Token is not available in config.')
        throw new Error('Token is not available in config.');
      }

      const connectWebSocket = () => {
        ws = new WebSocket('ws://37.27.179.208:8765');

        ws.onopen = () => {
          setError('')
          console.info('Connected to WebSocket!');
          ws?.send(token);
          setState('online')
        };

        ws.onmessage = async (event) => {
          console.info('Received a message from the server: ' + event.data);
          console.log(event);
          if (event.data.includes('.pdf')) {
            handlePrint(event.data);
          }
        };

        ws.onclose = () => {
          console.warn('WebSocket closed. Trying to reconnect in 5 seconds...');
          setState('offline');
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error: ' + error.message);
          ws?.close(1000, 'Normal closure');
          setState('offline');
        };
      };

      connectWebSocket();

    } catch (error) {
      setError('Error starting WebSocket')
      console.error('Error starting WebSocket:', error);
    }
  };

  useEffect(() => {
    startWebSocketClient();

    return () => {
      ws.close();
    };
  }, []);

  const colors = {
    online: 'bg-green-600',
    refreshing: 'bg-blue-600',
    offline: 'bg-red-600',
  }

  return (
    <>
      <div className="flex absolute top-0 left-0 right-0 items-center justify-between p-6">
        <div className="px-4 py-2 rounded-md shadow-2xl bg-[#232325]">
          <h1 className="text-white flexible-text-10">Sh.</h1>
        </div>
        <span className={`px-4 py-2 text-white rounded-lg uppercase ${colors?.[state]}`}>{state}</span>
      </div>
      <RouterComponent/>
      {error && <div className="flex absolute justify-center bottom-0 left-0 right-0 bg-red-500 text-white items-center p-6">
        {error}
      </div>}
    </>
  );
}
