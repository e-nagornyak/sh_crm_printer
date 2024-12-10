const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const pino = require('pino');
const pinoPretty = require('pino-pretty');

// Create logs directory if it doesn't exist
const LOG_DIR = path.join(app.getPath('userData'), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log file path
const LOG_FILE = path.join(LOG_DIR, 'app.log');

// Configure Pino logger
const logger = pino(
  {
    level: 'info', // Default log level
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({
    dest: LOG_FILE,
    sync: false // Enable async logging
  })
);

// Pretty printing for console (optional)
const prettyLogger = pino(
  pinoPretty({
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname'
  })
);

// Logging function
const log = async (event, logEntry) => {
  try {
    // Log to file
    logger.info(logEntry);

    // Optional: Log to console with pretty print
    prettyLogger.info(logEntry);
  } catch (error) {
    console.error('Logging error:', error);
  }
};

// Get logs with pagination and filtering
const getLogs = async (event, { page = 1, limit = 50, level = null, startDate = null, endDate = null }) => {
  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE)) {
      return {
        logs: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }

    // Read log file
    const logContent = fs.readFileSync(LOG_FILE, 'utf-8').trim();

    // If file is empty
    if (!logContent) {
      return {
        logs: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }

    // Parse logs
    let logs = logContent
      .split('\n')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (parseError) {
          console.error('Log parsing error:', line);
          return null;
        }
      })
      .filter(log => {
        // Optional filtering
        if (level && log.level !== level) return false;

        if (startDate) {
          const logDate = new Date(log.time);
          if (logDate < new Date(startDate)) return false;
        }

        if (endDate) {
          const logDate = new Date(log.time);
          if (logDate > new Date(endDate)) return false;
        }

        return log !== null;
      });

    // Sort from newest to oldest
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));

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
    console.error('Error retrieving logs:', error);
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
  logger // Expose logger for direct use if needed
};
