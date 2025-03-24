const fs = require("fs").promises
const path = require("path")
const { app } = require("electron")
const { z } = require("zod")

const configPath = path.join(app.getPath("userData"), "config.json")

const defaultConfig = {
  token: "",
  printers: [
    { label: "Factura Printer", default: "" },
    { label: "Label Printer", default: "" },
  ],
}

const configSchema = z.object({
  token: z.string(),
  printers: z.array(
    z.object({
      label: z.enum(["Factura Printer", "Label Printer"]),
      default: z.string(),
    })
  ),
})

const ensureConfigFileExists = async () => {
  try {
    await fs.access(configPath, fs.constants.F_OK)
    const configFile = await fs.readFile(configPath, "utf-8")
    const parsedConfig = JSON.parse(configFile)
    configSchema.parse(parsedConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid config structure, resetting to default")
    } else {
      console.log(
        "Config file does not exist, creating a new one with default settings"
      )
    }

    try {
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2))
      console.log("Config file created with default settings")
    } catch (writeError) {
      console.error("Error creating config file:", writeError)
    }
  }
}

const getConfig = async () => {
  try {
    const data = await fs.readFile(configPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading config.json:", error)
    return { error: "Failed to load config" }
  }
}

const saveConfig = async (newConfig) => {
  try {
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2))
    console.log("Config saved successfully")
    return true
  } catch (error) {
    console.error("Error saving config.json:", error)
    return false
  }
}

module.exports = {
  ensureConfigFileExists,
  getConfig,
  saveConfig,
}
