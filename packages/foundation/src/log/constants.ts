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
enum LOG_TAGS {
  DEBUG = 'DEBUG',
  MAIN = 'MAIN',
  NETWORK = 'NETWORK',
  TELEPHONY = 'TELEPHONY',
}

export { LOG_LEVEL, LOG_TAGS };
