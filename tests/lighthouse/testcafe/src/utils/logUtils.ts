/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 09:10:27
 */
import * as Log4js from 'log4js';
import { Config } from '..';

Log4js.configure({
  appenders: {
    out: {
      type: 'stdout', layout: {
        type: 'pattern',
        pattern: '%[%d %p %c%]%n%m%n',
      }
    }
  },
  categories: { default: { appenders: ['out'], level: Config.loggerLevel } }
});

class LogUtils {

  static getLogger(name: string): Log4js.Logger {
    return Log4js.getLogger(name);
  }
}

export {
  LogUtils
}
