import React, { useEffect, useState } from "react";

export default function App() {
  const [printers, setPrinters] = useState([]);

  useEffect(() => {
    // Викликаємо API для отримання списку принтерів
    window.printerAPI.getPrinters()
      .then(printers => {
        setPrinters(printers);
      })
      .catch(err => {
        console.error('Error getting printers:', err);
      });
  }, []);

  return (
    <div className="min-h-screen max-h-full bg-zinc-950">
      <div className="font-bold text-white">Available Printers:</div>
      <ul className="text-white">
        {printers.map((printer, index) => (
          <li key={index}>{printer.name}</li>
        ))}
      </ul>
    </div>
  );
}
