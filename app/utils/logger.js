const { createLogger, format, transports } = require('winston');

const { combine, printf, errors } = format;

const Colors = {
  info: '\x1b[36m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  verbose: '\x1b[43m',
  debug: '\x1b[43m',
};

const logger = createLogger({
  exitOnError: false,
  levels: {
    debug: 4,
    info: 3,
    silly: 2,
    warn: 1,
    error: 0,
  },
  format: combine(
    printf(info => {
      const splat = info[Symbol.for('splat')];
      if (splat) {
        // const meta = util.inspect(splat[0], false, null);
        return `${Colors[info.level]}[${info.level}] ${info.message} - meta: ${JSON.stringify(splat[0])}\x1b[0m`;
      }
      return `${Colors[info.level]}[${info.level}] ${info.message} \x1b[0m`;
    }),
    errors({ stack: true }),
  ),
  transports: [
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      stderrLevels: ['error', 'warning'],
    }),
  ],
});

module.exports = logger;
