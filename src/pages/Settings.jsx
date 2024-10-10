import React, { useEffect, useState } from 'react';
import { Card } from "../components/Card.jsx";

const Settings = () => {
  const [loading, setLoading] = useState(false)
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
         setLoading(true)
        await Promise.all([getPrinters(), getConfig()]);
      } catch (error) {
        console.error("Error occurred while fetching printers and config:", error);
        }
    finally {
        setLoading(false)
     }
    };

    asyncFunctions();
  }, []);

  const handleSavePrinter = async (e, item) => {
    try {
      setLoading(true)
      const selectedPrinterName = e?.target?.value;

      // Оновлюємо ім'я принтера і зберігаємо в конфігурацію
      const updatedConfig = {
        ...config, printers: config?.printers?.map(p => p?.label === item?.label ? { ...p, default: selectedPrinterName } : p)
      };
      const res = await window.configAPI.saveConfig(updatedConfig)
      if (res){
         setConfig(updatedConfig)
      }
    } catch (e) {
      console.log(e)
    } finally{
      setLoading(false)
    }
  };

  return (
    <Card title="Settings">
    <div className="size-full space-y-3">
    {config?.printers?.map((item, index) => (
      <div key={item?.label} className="flex flex-col gap-2">
        <label htmlFor={`printer-${index}`} className="text-white font-semibold text-base">{item?.label}</label>
        <select
        disabled={loading}
          value={item?.default || ''}
             onChange={(e) => handleSavePrinter(e, item)} id={`printer-${index}`}
          className="px-4 py-2 text-white font-semibold text-base bg-black rounded-md shadow-md hover:bg-gray-800 focus:bg-gray-900 focus:shadow-lg transition-all duration-300 focus:outline-none disabled:opacity-50"
        >
          <option value={''}>None</option>
          {printers?.map(p => <option value={p?.DeviceID}>{p?.DeviceID}</option>)}
        </select>
      </div>
    ))}
    </div>
    </Card>

  );
};

export default Settings;
