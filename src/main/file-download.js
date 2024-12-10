const fs = require("fs")
const path = require("path")
const axios = require("axios")
const printer = require("pdf-to-printer")
const { app } = require("electron")
const { getConfig } = require("./config-manager")

const basePath =
  process.env.NODE_ENV === "development" ? __dirname : process.resourcesPath

const downloadFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath)
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve)
    writer.on("error", reject)
  })
}

const handleDownloadAndPrint = async (event, pdfUrl, printerLabel) => {
  const filePath = path.join(
    app.getPath("userData"),
    "temp_downloaded_file.pdf"
  )

  try {
    console.info(`Received request to download and print: ${pdfUrl}`)

    await downloadFile(pdfUrl, filePath)
    console.info(`File downloaded successfully: ${filePath}`)

    const config = await getConfig()
    const defaultPrinterName = config.printers.find(
      (p) => p?.label === printerLabel
    )
    console.info(`defaultPrinterName: ${defaultPrinterName}`)

    const options = {
      printer: defaultPrinterName?.default,
      sumatraPdfPath: path.join(basePath, "SumatraPDF-3.4.6-32.exe"),
      scale: "noscale",
      paperSize: "6",
      win32: [
        '-print-settings "noscale"',
        '-print-settings "center"',
        "-orientation portrait",
        "-paper-size A6",
        "-margin-top 0",
        "-margin-right 0",
        "-margin-bottom 0",
        "-margin-left 0",
      ],
    }
    console.log("print options", options)

    await printer.print(filePath, options)
    console.info("The file was successfully sent for printing.")

    setTimeout(() => {
      fs.unlinkSync(filePath)
      console.info("Temporary file deleted.")
    }, 500)
  } catch (error) {
    console.error(`Error processing file: ${error.message}`)
  }
}

module.exports = {
  handleDownloadAndPrint,
}
