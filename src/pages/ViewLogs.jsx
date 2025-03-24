import React, { useState, useEffect } from "react"
import { ContextBridgeAPI } from "../constants/context-bridge-apis.js"
import { Card } from "../components/Card.jsx"
import { Button } from "../components/Button.jsx"
import { logsMap, LOGS_TYPE } from "../constants/logs.js"

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0") // Months are zero-indexed
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")

  return `${hours}:${minutes}:${seconds}, ${day}.${month}.${year}`
}

const ViewLogs = () => {
  const API = window?.[ContextBridgeAPI.loggingAPI.name]

  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [level, setLevel] = useState(LOGS_TYPE.INFO)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = async (params) => {
    const result = await API.getLogs(params)
    setLogs(result.logs)
    setTotalPages(result.totalPages)
  }

  const getLogs = async () => {
    await fetchLogs({ page, limit, level })
  }

  const clearLogs = async () => {
    try {
      await API.clearLogs()
      await getLogs()
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getLogs()
  }, [page, limit, level])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <Card className="overflow-auto flex-1 w-full">
      <div className="flex flex-col justify-between flex-1 w-full gap-3">
        <div className="flex justify-between w-full items-center">
          <div className="flex justify-between items-center gap-6">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="text-white font-semibold text-base bg-black rounded-md shadow-md"
            >
              {logsMap?.map((e) => (
                <option value={e?.key}>{e?.displayName}</option>
              ))}
            </select>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-white font-semibold text-base bg-black rounded-md shadow-md"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <Button onClick={clearLogs}>Clear</Button>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {logs?.length ? (
            logs?.map((log, index) => (
              <div
                key={index}
                className="border flex items-center gap-2 border-gray-500 p-2 rounded"
              >
                <span>{log?.time ? formatTimestamp(log?.time) : "-"}</span>
                <span className="h-5 bg-white w-px" />
                <span>{JSON.stringify(log?.message) || log?.message}</span>
              </div>
            ))
          ) : (
            <div className="size-full flex items-center justify-center text-lg">
              No logs yet
            </div>
          )}
        </div>
        <div className="pagination flex justify-center space-x-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="p-2">
            {page} / {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ViewLogs
