import React, { useEffect, useState } from 'react';
import { Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";

const Settings = () => {
  const [printers, setPrinters] = useState([])
  const [config, setConfig] = useState({ defaultPrinter: "" });

  const getPrinters = async () => {
    try {
      const printers = await window.printerAPI.getPrinters()
      setPrinters(printers || [])
    } catch (e) {
      console.log(e)
    }
  }

  const getConfig = async () => {
    try {
      const baseConfig = await window.configAPI.getConfig()
      setConfig(baseConfig)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const asyncFunctions = async () => {
      try {
        await Promise.all([getPrinters(), getConfig()]);
      } catch (error) {
        console.error("Error occurred while fetching printers and config:", error);
      }
    };

    asyncFunctions();
  }, []);

  const handleSavePrinter = async (e, item) => {
    try {
      const selectedPrinterName = e?.value;
      // Оновлюємо ім'я принтера і зберігаємо в конфігурацію
      const updatedConfig = {
        ...config, printers: config?.printers?.map(p => p?.label === item?.label ? { ...item?.label, default: selectedPrinterName } : item?.label)
      };
      const savedConfig = await window.configAPI.saveConfig(updatedConfig)
      setConfig(savedConfig)
    } catch (e) {
      console.log(e)
    }
  };

  return (
    <Card title="Settings Page">
    <div className="size-full space-y-3">
    {config?.printers?.map((item, index) => (
      <div key={item?.label} className="flex flex-col gap-2">
        <label htmlFor={`printer-${index}`} className="text-white font-semibold text-base">{item?.label}</label>
        <select
          onChange={(e) => handleSavePrinter(e, item)} id={`printer-${index}`}
          className="px-4 py-2 text-white font-semibold text-base bg-black rounded-md shadow-md hover:bg-gray-800 focus:bg-gray-900 focus:shadow-lg transition-all duration-300 focus:outline-none"
        >
          {printers?.map(p => <option value={p}>1</option>)}
        </select>
      </div>
    ))}
    </div>
    </Card>

  );
};

export default Settings;
