const LOGS_TYPE = {
  INFO: "info",
  PRINTER: "printer",
  CASH_REGISTER: "cash-register",
  ERROR: "error",
}

const logsMap = Object.keys(LOGS_TYPE).map((key) => ({
  key: key,
  displayName: LOGS_TYPE[key],
}))

module.exports = {
  LOGS_TYPE,
  logsMap,
}
