import React, { useEffect } from 'react';
import { Card } from "../components/Card.jsx";
import { ContextBridgeAPI } from '../constants/context-bridge-apis.js'

const ViewLogs = () => {
  const API = window?.[ContextBridgeAPI.loggingAPI.name]
  // const getPrinters = async () => {
  //   try {
  //     const printers = await window.printerAPI.getPrinters()
  //     setPrinters(printers || [])
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  const getLogs = async () => {
    const result = await API.getLogs({
      page: 1,
      limit: 20,
      level: 'info'
    })
    console.log(result.logs)
  }

  return (
    <Card title="Logs">
    <button onClick={getLogs} className="size-full space-y-3">
      get logs
    </button>
    <button onClick={() => {
      API.createLog('info', { userId: 123 })
    }} className="size-full space-y-3">
      Send
    </button>
    <button onClick={async () => {
      await API.clearLogs()
    }} className="size-full space-y-3">
      Clear
    </button>
    </Card>

  );
};

export default ViewLogs;
