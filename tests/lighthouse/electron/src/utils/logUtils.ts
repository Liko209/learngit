/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 08:51:10
 */

import * as Log4js from 'log4js';
import { Config } from '../config';

// see : https://github.com/log4js-node/log4js-node/blob/master/docs/layouts.md
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
