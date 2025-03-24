const { FusesPlugin } = require("@electron-forge/plugin-fuses")
const { FuseV1Options, FuseVersion } = require("@electron/fuses")

module.exports = {
  packagerConfig: {
    asar: true,
    packagerConfig: {
      asar: true,
      icon: "./src/assets/icon", // Specify the path to the icon without extension
      // icon can be a path to an .ico (for Windows), .icns (for macOS), or .png (for Linux) file
    },
    extraResource: ["node_modules/pdf-to-printer/dist/SumatraPDF-3.4.6-32.exe"],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel", // Maker for Windows (Squirrel)
      config: {
        name: "Sh_Printer", // Name of your application
        setupExe: "Sh_printer.exe", // The name of the installation file
        authors: "Sh.", // Author of the application
        description: "Description of my printer", // Description
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    // {
    //   name: '@electron-forge/maker-deb', // Для Linux (Debian-based дистрибутиви)
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm', // Для Linux (RPM-based дистрибутиви)
    //   config: {},
    // },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    {
      name: "@electron-forge/plugin-webpack",
      // devContentSecurityPolicy: 'default-src \'self\' \'unsafe-inline\' data:; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data:',
      config: {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
              preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}
