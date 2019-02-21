/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 09:10:27
 */
import * as Log4js from 'log4js';

class LogUtils {

    constructor() {
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
            categories: { default: { appenders: ['out'], level: process.env.LOGGER_LEVEL } }
        });
    }

    getLogger(name: string): Log4js.Logger {
        return Log4js.getLogger(name);
    }
}

const logUtils = new LogUtils();
export {
    logUtils
}
