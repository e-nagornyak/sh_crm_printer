const ContextBridgeAPI = {
  cacheRegisterAPI: {
    name: 'cacheRegisterAPI',
    keys: {
      SEND_TO_PRINTER: "send-to-cache-register",
    }
  },
  loggingAPI: {
    name: 'loggingAPI',
    keys: {
      CREATE_LOG: "create-log",
      GET_LOGS: "get-logs",
      CLEAR_LOGS: "clear-logs"
    }
  },
}


module.exports = { ContextBridgeAPI }

