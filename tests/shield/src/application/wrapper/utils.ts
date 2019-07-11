/*
 * @Author: isaac.liu
 * @Date: 2019-07-08 08:48:57
 * Copyright © RingCentral. All rights reserved.
 */
import { waitDone } from '../../utils';

type ContextFunction = (callback?: Function) => any;

function wrap(oridinalMethod: Function, ctxFunction: ContextFunction) {
  return function (this: Function, ...args: any[]) {
    if (ctxFunction) {
      let result;
      const value = ctxFunction(() => (result = oridinalMethod.apply(this, args)));
      if (value && value.then) {
        // Promise like
        return value;
      }
      return result;
    }
    return oridinalMethod.apply(this, args);
  };
}

function decorate(ctxFunction: ContextFunction): any {
  return function (target: any, propertyName: string, descriptor?: any) {
    // bound instance methods
    if (!descriptor) {
      Object.defineProperty(target, propertyName, {
        configurable: true,
        enumerable: false,
        get() {
          return undefined;
        },
        set(oridinalMethod) {
          Object.defineProperty(this, propertyName, {
            enumerable: false,
            writable: true,
            configurable: true,
            value: wrap(oridinalMethod, ctxFunction),
          });
        },
      });
      return;
    }

    // @action method = () => {}
    if (descriptor.initializer) {
      return {
        enumerable: false,
        configurable: true,
        writable: true,
        initializer() {
          // N.B: we can't immediately invoke initializer; this would be wrong
          return wrap(descriptor.initializer!.call(this), ctxFunction);
        },
      };
    }

    // @action method() { }
    if (descriptor.value) {
      const oridinalMethod = descriptor.value;
      return {
        value: wrap(oridinalMethod, ctxFunction),
        enumerable: false,
        configurable: true, // See #1477
        writable: true, // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)
      };
    }

    return descriptor;
  };
}

const needWait = decorate(waitDone);

export { decorate, needWait };
