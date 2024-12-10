const LOGS_TYPE = {
  INFO: "info",
  PRINTER: "printer",
  CASH_REGISTER: "cash-register",
  ERROR: "error",
}

const logsMap = Object.keys(LOGS_TYPE).map((key) => ({
  key: LOGS_TYPE[key],
  displayName: key,
}))

module.exports = {
  LOGS_TYPE,
  logsMap,
}
