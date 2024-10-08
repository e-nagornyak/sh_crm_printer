// src/pages/Settings.jsx
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

const Settings = () => {
  const [printers, setPrinters] = useState([])
  const [config, setConfig] = useState({ defaultPrinter: "" });
  const [newPrinterName, setNewPrinterName] = useState("");

  useEffect(() => {
    // Отримуємо конфігурацію при завантаженні компонента
    window.configAPI.getConfig()
      .then((config) => {
        setConfig(config); // Зберігаємо конфігурацію у стан
        setNewPrinterName(config.user?.printers.defaultLabel); // Ініціалізуємо ім'я принтера
      })
      .catch((err) => {
        console.error('Error getting config:', err);
      });

    window.printerAPI.getPrinters()
      .then((printers) => {
        setPrinters((printers))
      })
      .catch((err) => {
        console.error('Error getting config:', err);
      });

  }, []);

  const handleSavePrinter = () => {
    // Оновлюємо ім'я принтера і зберігаємо в конфігурацію
    const updatedConfig = {
      ...config, user: {
        printers: {
          defaultLabel: newPrinterName
        }
      }
    };
    console.log("updatedConfig", updatedConfig)
    window.configAPI.saveConfig(updatedConfig)
      .then(success => {
        if (success) {
          console.log('Printer name updated successfully');
          setConfig(updatedConfig); // Оновлюємо локальний стан після збереження
        }
      })
      .catch(err => {
        console.error('Error saving config:', err);
      });
  };
  console.log('printers',printers)
  return (
    <div className="w-full h-screen items-center justify-center flex flex-col">
    <h1>Settings Page</h1>
    <Link to="/">Go to Home</Link>
    <div className="bg-white max-h-full">
    <div className="font-bold text-white">Current Printer: {config.defaultPrinter}</div>
    <input
      type="text"
      value={newPrinterName}
      onChange={(e) => setNewPrinterName(e.target.value)}
      className="text-black"
      placeholder="Enter new printer name"
    />
    <button onClick={handleSavePrinter} className="bg-blue-500 text-white p-2 mt-2">
      Save Printer
    </button>
    <div>
      <label htmlFor="printers_list_factura">Factura Printer</label>
      <select id="printers_list_factura">
        {printers.map(p => <option value={p}></option>)}
      </select>
    </div>
    </div>
    </div>
  );
};

export default Settings;
