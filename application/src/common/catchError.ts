/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-02 14:15:01
 * Copyright © RingCentral. All rights reserved.
 */

import { ToastType, ToastMessageAlign } from '@/containers/ToastWrapper/Toast/types';
import { Notification, ShowNotificationOptions } from '@/containers/Notification';
import { generalErrorHandler } from '@/utils/error';
import { errorHelper } from 'sdk/error';

type ErrorActionConfig = string | Function;

type NotifyErrorProps = {
  doGeneral?: boolean;
  network?: ErrorActionConfig;
  server?: ErrorActionConfig;
  notificationOpts?: ShowNotificationOptions;
};

type StrategyProps = {
  condition: Function;
  action: Function;
};

type CatchOptionsProps = NotifyErrorProps | StrategyProps[];

enum NOTIFICATION_TYPE {
  CUSTOM,
  FLASH,
  FLAG,
}

const defaultOptions = {
  type: ToastType.ERROR,
  messageAlign: ToastMessageAlign.LEFT,
  fullWidth: false,
  dismissible: false,
};

function notify(
  ctx: any,
  notificationType: NOTIFICATION_TYPE,
  action: ErrorActionConfig,
  notificationOpts: ShowNotificationOptions,
  error: Error,
) {
  if (typeof action === 'function') {
    return action.call(null, error, ctx);
  }

  if (notificationType === NOTIFICATION_TYPE.FLASH) {
    return Notification.flashToast({
      message: action,
      ...notificationOpts,
    });
  }

  return Notification.flagToast({
    message: action,
    ...notificationOpts,
  });
}

function perform(options: StrategyProps[], error: Error, ctx: any) {
  const result = options.some(({ condition, action }) => {
    if (condition(error, ctx)) {
      action(error, ctx);
      return true;
    }
    return false;
  });
  if (!result) {
    throw error;
  }
}

function handleError(
  notificationType: NOTIFICATION_TYPE,
  error: any,
  ctx: any,
  options: CatchOptionsProps,
) {
  if (Array.isArray(options)) {
    return perform(options, error, ctx);
  }

  const { network, server, doGeneral, notificationOpts = defaultOptions } = options;
  if (network && errorHelper.isNetworkConnectionError(error)) {
    return notify(ctx, notificationType, network, notificationOpts, error);
  }

  if (server && errorHelper.isBackEndError(error)) {
    return notify(ctx, notificationType, server, notificationOpts, error);
  }

  if (doGeneral) {
    return generalErrorHandler(error);
  }

  throw error;
}

function wrapHandleError(
  oridinalMethod: Function,
  notificationType: NOTIFICATION_TYPE,
  options: CatchOptionsProps,
) {
  return function (this: Function, ...args: any[]) {
    try {
      const result = oridinalMethod.apply(this, args);

      // if method is asynchronous
      if (result instanceof Promise) {
        return result.catch((error: any) => {
          handleError(notificationType, error, this, options);
        });
      }
      return result;
    } catch (error) {
      handleError(notificationType, error, this, options);
    }
  };
}

function decorate(notificationType: NOTIFICATION_TYPE, options: CatchOptionsProps): any {
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
            value: wrapHandleError(oridinalMethod, notificationType, options),
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
          return wrapHandleError(descriptor.initializer!.call(this), notificationType, options);
        },
      };
    }

    // @action method() { }
    if (descriptor.value) {
      const oridinalMethod = descriptor.value;
      return {
        value: wrapHandleError(oridinalMethod, notificationType, options),
        enumerable: false,
        configurable: true, // See #1477
        writable: true, // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)
      };
    }

    return descriptor;
  };
}

function catchError(options: StrategyProps[]) {
  return decorate(NOTIFICATION_TYPE.CUSTOM, options);
}

catchError.flash = function (options: NotifyErrorProps) {
  return decorate(NOTIFICATION_TYPE.FLASH, options);
};

catchError.flag = function (options: NotifyErrorProps) {
  return decorate(NOTIFICATION_TYPE.FLAG, options);
};

export { catchError };
