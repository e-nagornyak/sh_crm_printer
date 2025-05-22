import React, { useEffect, useState } from "react"
import RouterComponent from "./Router.jsx"
import useAppState from "./hooks/AppState.js"
import { LOGS_TYPE } from "./constants/logs"
import { Notification } from "electron"

export default function App() {
  const { state, setState } = useAppState()
  const [error, setError] = useState("")
  const [withReconnect, setWithReconnect] = useState(true)

  let ws = null

  const handlePrint = async (pdfUrl) => {
    // Call the IPC method to download and print a PDF file
    try {
      await window.loggingAPI.createLog(LOGS_TYPE.PRINTER, { pdfUrl })
      await window.printerAPI.downloadAndPrintPDF(pdfUrl, "Label Printer")
    } catch (e) {
      console.log(e)
    }
  }

  const handleSendToCacheRegister = async (commands) => {
    if (commands?.length) {
      await window.loggingAPI.createLog(LOGS_TYPE.CASH_REGISTER, {
        command_request: commands,
      })

      const response =
        await window.cacheRegisterAPI.sendToCacheRegister(commands)

      await window.loggingAPI.createLog(LOGS_TYPE.CASH_REGISTER, {
        command_response: response,
      })
    }
  }

  const startWebSocketClient = async () => {
    try {
      // We get the config with the token
      const baseConfig = await window.configAPI.getConfig()
      const token = baseConfig?.token // Assuming the token is stored in the config
      const defaultPrinterName = baseConfig.printers.find(
        (p) => p?.label === "Label Printer"
      )

      if (!token) {
        throw new Error("Token is not available in config.")
      }

      if (!defaultPrinterName) {
        throw new Error("Label printer is not available in config.")
      }

      const connectWebSocket = () => {
        try {
          // ws = new WebSocket("ws://37.27.179.208:8765")
          ws = new WebSocket("ws://37.27.179.208:4242")

          ws.onopen = () => {
            setError("")
            console.info("Connected to WebSocket!")
            ws?.send(token)
            setState("online")
          }

          ws.onmessage = async (event) => {
            console.info("Received a message from the server: " + event.data)

            if (event.data === "Invalid printer token") {
              console.warn("Invalid printer token. Closing WebSocket...")
              setError("Invalid printer token.")
              setWithReconnect(false)
              ws?.close(4001, "Invalid printer token")
            }

            if (event.data.includes(".pdf")) {
              await handlePrint(event.data)
              return
            }

            const parsedData = event?.data && JSON.parse(event?.data)

            if (!parsedData) return

            if (parsedData?.type === "cache-register") {
              await handleSendToCacheRegister(parsedData?.commands)
            }
          }

          ws.onclose = () => {
            console.warn(
              "WebSocket closed. Trying to reconnect in 10 seconds..."
            )
            setState("offline")
            withReconnect && setTimeout(connectWebSocket, 10000)
          }

          ws.onerror = (error) => {
            console.error("WebSocket error: " + error.message)
            setError("WebSocket error: " + error.message || "")
            ws?.close(1000, "Normal closure")
            setState("offline")
          }
        } catch (e) {
          console.log("bla", e)
        }
      }

      connectWebSocket()
    } catch (error) {
      setError(error?.message || "Error starting WebSocket")
      setState("offline")
      console.error("Error starting WebSocket:", error)
    }
  }

  useEffect(() => {
    void startWebSocketClient()

    return () => {
      ws.close()
    }
  }, [])

  const colors = {
    online: "bg-green-600",
    refreshing: "bg-blue-600",
    offline: "bg-red-600",
  }

  function showNotification(title, body) {
    const notification = new Notification({
      title: "title",
      body: "body",
      // icon: "path/to/icon.png", // опціонально
      silent: false, // опціонально
    })

    notification.show()

    // Додаткові події
    notification.on("click", () => {
      console.log("Користувач клікнув на сповіщення")
    })
  }

  return (
    <div className="flex flex-col items-center justify-between overflow-hidden p-6 flex-1 relative w-full">
      <div className="flex items-center w-full justify-between">
        <div className="px-4 py-2 border border-gray-500 rounded-md shadow-2xl bg-[#232325]">
          <h1 className="text-white flexible-text-10">Sh.</h1>
        </div>
        <span
          className={`px-4 border border-gray-500 py-2 text-white rounded-lg uppercase ${colors?.[state]}`}
        >
          {state}
        </span>
      </div>
      <button onClick={showNotification}>Bla</button>
      <RouterComponent />
      <div
        className={`flex justify-center border border-gray-500 rounded-md w-full bottom-0 left-0 right-0 text-white items-center p-6 ${error ? "bg-red-500" : ""}`}
      >
        {error || ""}
      </div>
    </div>
  )
}
