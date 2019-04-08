enum LOG_LEVEL {
  OFF = Number.MAX_VALUE,
  FATAL = 50000,
  ERROR = 40000,
  WARN = 30000,
  INFO = 20000,
  DEBUG = 10000,
  TRACE = 5000,
  LOG = 4000,
  ALL = Number.MIN_VALUE,
}

enum LOG_APPENDER {
  NONE = 0,
  CONSOLE = 1,
  LOCAL_STORAGE = 1 << 1,
  ALL = CONSOLE | LOCAL_STORAGE,
}

const LOG_LEVEL_STRING = {
  [LOG_LEVEL.FATAL]: 'FATAL',
  [LOG_LEVEL.ERROR]: 'ERROR',
  [LOG_LEVEL.WARN]: 'WARN',
  [LOG_LEVEL.INFO]: 'INFO',
  [LOG_LEVEL.DEBUG]: 'DEBUG',
  [LOG_LEVEL.TRACE]: 'TRACE',
};

enum DATE_FORMATTER {
  DEFAULT_DATE_FORMAT = 'yyyy-MM-ddThh:mm:ssO',
}

enum LOG_TAGS {
  DEBUG = 'DEBUG',
  MAIN = 'MAIN',
  NETWORK = 'NETWORK',
  TELEPHONY = 'TELEPHONY',
}

export { LOG_LEVEL, LOG_APPENDER, DATE_FORMATTER, LOG_LEVEL_STRING, LOG_TAGS };
