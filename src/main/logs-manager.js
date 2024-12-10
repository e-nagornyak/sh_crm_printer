const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const pino = require('pino');

// Create logs directory if it doesn't exist
const LOG_DIR = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log file path
const LOG_FILE = path.join(LOG_DIR, 'app.log');

// Configure Pino logger with more explicit options
const logger = pino(
  {
    level: 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({
    dest: LOG_FILE,
    sync: true // Changed to sync for debugging
  })
);

// Logging function with enhanced logging
const log = async (event, logEntry) => {
  try {
    // Ensure logEntry has a timestamp if not provided
    const entryToLog = {
      ...logEntry,
      timestamp: logEntry.timestamp || new Date().toISOString()
    };

    // Log full object with more details
    logger.info(entryToLog);

    // Debug logging to console
    console.log('Logging entry:', JSON.stringify(entryToLog, null, 2));
    console.log('Log file path:', LOG_FILE);
  } catch (error) {
    console.error('Detailed logging error:', error);
  }
};

// Get logs with extensive debugging
const getLogs = async (event, { page = 1, limit = 50, level = null, startDate = null, endDate = null }) => {
  try {
    // Extensive file existence and content checks
    console.log('Checking log file:', LOG_FILE);
    console.log('File exists:', fs.existsSync(LOG_FILE));

    if (!fs.existsSync(LOG_FILE)) {
      console.error('Log file does not exist');
      return {
        logs: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }

    // Read log file with error handling
    let logContent;
    try {
      logContent = fs.readFileSync(LOG_FILE, 'utf-8').trim();
    } catch (readError) {
      console.error('Error reading log file:', readError);
      return {
        logs: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }

    console.log('Log file content length:', logContent.length);

    // If file is empty
    if (!logContent) {
      console.error('Log file is empty');
      return {
        logs: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }

    // Parse logs with detailed error handling
    let logs = [];
    const lines = logContent.split('\n');

    console.log('Total log lines:', lines.length);

    lines.forEach((line, index) => {
      try {
        if (line.trim()) {
          const parsedLog = JSON.parse(line);
          logs.push(parsedLog);
        }
      } catch (parseError) {
        console.error(`Error parsing log line ${index}:`, line);
        console.error('Parse error:', parseError);
      }
    });

    console.log('Successfully parsed logs:', logs.length);

    // Sort from newest to oldest
    logs.sort((a, b) => new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time));

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedLogs = logs.slice(startIndex, startIndex + limit);

    return {
      logs: paginatedLogs,
      total: logs.length,
      page,
      limit,
      totalPages: Math.ceil(logs.length / limit)
    };
  } catch (error) {
    console.error('Catastrophic error in getLogs:', error);
    return {
      logs: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0
    };
  }
};

// Clear logs
const clearLogs = async () => {
  try {
    fs.writeFileSync(LOG_FILE, '');
    console.log('Logs cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing logs:', error);
    return false;
  }
};

module.exports = {
  log,
  getLogs,
  clearLogs,
  logger
};
