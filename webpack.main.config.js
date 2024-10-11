const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const CspPlugin = require('csp-webpack-plugin');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/assets'), to: 'assets' } // Копіюємо папку assets
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/pdf-to-printer/dist/SumatraPDF-3.4.6-32.exe',
          to: './',
        },
      ]
    })
  ],
  module: {
    rules: require('./webpack.rules'),
  },
};
