/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 10:14:45
 */

import { logUtils } from './LogUtils';

class FunctionUtils {
    private logger = logUtils.getLogger(__filename);

    contain(func: Function, funcArr: Array<Function>): boolean {
        let funcId = func.toString();
        for (let f of funcArr) {
            if (funcId === f.toString()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param target : EventEmitter 
     */
    bindEvent(target, eventName: string, func: Function): boolean {
        let listeners = target.listeners(eventName);
        let needBind = !this.contain(func, listeners);

        if (needBind) {
            target.on(eventName, func);
        }

        this.logger.info(`${eventName} listener size : ${listeners.length}, needBind : ${needBind}`);
        return needBind;
    }

    unbindEvent(target, eventName: string, func: Function): boolean {
        let listeners = target.listeners(eventName);
        let contain = this.contain(func, listeners);

        if (contain) {
            target.off(eventName, func);
        }

        return contain;
    }
}

const functionUtils = new FunctionUtils();

export {
    functionUtils
}