import React, { useEffect, useState } from "react"
import { API, API_PATHS } from "../lib/api.js"
import { LOGS_TYPE } from "../constants/logs"

export default function CashRegisterController() {
  const [withReconnect, setWithReconnect] = useState(true)
  const [state, setState] = useState("offline")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  let ws = null

  const handleSendToCacheRegister = async (payload) => {
    try {
      const parsedPayload = JSON.parse(payload)
      const task = parsedPayload?.task
      const uuid = parsedPayload?.uuid
      const parsedCommands = JSON.parse(task)?.commands

      if (!uuid || !task || !parsedCommands?.length) {
        console.error("Invalid task data:", task)
        return
      }

      if (parsedCommands?.length) {
        setState("printing")

        await window.loggingAPI.createLog(LOGS_TYPE.CASH_REGISTER, {
          command_request: parsedCommands,
        })

        const response =
          await window.cacheRegisterAPI.sendToCacheRegister(parsedCommands)

        await window.loggingAPI.createLog(LOGS_TYPE.CASH_REGISTER, {
          command_response: response,
        })

        await API.deleteTask(uuid)
      }
    } catch (e) {
      console.error("sendToCacheRegister", e)
    } finally {
      setState("online")
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
          ws = new WebSocket(API_PATHS.TEST_WS)

          ws.onopen = () => {
            console.info("Connected to WebSocket!")
            ws?.send(token)
            setState("online")
          }

          ws.onmessage = async (event) => {
            console.info("Received a message from the server: " + event.data)

            if (event.data === "Invalid printer token") {
              console.warn("Invalid printer token. Closing WebSocket...")
              setWithReconnect(false)
              ws?.close(4001, "Invalid printer token")
            }

            if (!event?.data) return

            await handleSendToCacheRegister(event?.data)
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
            ws?.close(1000, "Normal closure")
            setState("offline")
          }
        } catch (e) {
          console.log("error", e)
        }
      }

      connectWebSocket()
    } catch (error) {
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
    printing: "bg-blue-600",
    offline: "bg-red-600",
  }

  const clearQueue = async () => {
    try {
      await API.clearAllTasks()
      setIsDropdownOpen(false)

      new window.Notification("Queue cleared")
    } catch (e) {
      console.error(e)
      new window.Notification("Error clearing queue")
    }
  }

  return (
    <div className="relative inline-block">
      <div className="flex items-center">
        <span
          className={`px-4 border border-gray-500 py-2 text-white rounded-l-lg uppercase ${colors?.[state]}`}
        >
          Cashier - {state}
        </span>

        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`px-2 py-2 border-t min-w-8 border-r border-b border-gray-500 text-white uppercase rounded-r-lg ${colors?.[state]} hover:opacity-80`}
        >
          {isDropdownOpen ? "-" : "+"}
        </button>
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-full">
          <button
            onClick={clearQueue}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear queue
          </button>
        </div>
      )}

      {/* Overlay для закриття dropdown при кліку поза ним */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
