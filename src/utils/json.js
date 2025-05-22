function isValidJson(data) {
  try {
    if (!data) {
      return false
    }

    const parsed = JSON.parse(data)
    return typeof parsed === "object" && parsed !== null
  } catch (e) {
    return false
  }
}

export { isValidJson }
