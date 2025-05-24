import React, { useEffect, useState } from "react"
// import { LOGS_TYPE } from "../constants/logs"
import { API, API_PATHS } from "../lib/api.js"
import { isValidJson } from "../utils/json.js"

export default function CashRegisterController() {
  const [withReconnect, setWithReconnect] = useState(true)
  const [state, setState] = useState("offline")

  let ws = null

  const handleSendToCacheRegister = async (payload) => {
    const parsedPayload = JSON.parse(payload)
    const task = parsedPayload?.task
    const uuid = parsedPayload?.uuid
    const parsedCommands = JSON.parse(task)?.commands

    console.log("parsedPayload", parsedPayload)
    console.log("task", task)
    console.log("uuid", uuid)
    console.log("parsedCommands", parsedCommands)

    if (!uuid || !task || !parsedCommands?.length) {
      console.error("Invalid task data:", task)
      return
    }

    if (parsedCommands?.length) {
      setState("printing")
      await new Promise((res) => setTimeout(res, 3000))
      await API.deleteTask(uuid)
    }

    // if (commands?.length) {
    //   await window.loggingAPI.createLog(LOGS_TYPE.CASH_REGISTER, {
    //     command_request: commands,
    //   })
    //

    //   const response =
    //     await window.cacheRegisterAPI.sendToCacheRegister(commands)

    //   await window.loggingAPI.createLog(LOGS_TYPE.CASH_REGISTER, {
    //     command_response: response,
    //   })
    // }
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

  return (
    <span
      className={`px-4 border border-gray-500 py-2 text-white rounded-lg uppercase ${colors?.[state]}`}
    >
      Cashier - {state}
    </span>
  )
}
