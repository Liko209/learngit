/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-02 14:15:01
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import {
  Notification,
  ShowNotificationOptions,
} from '@/containers/Notification';
import { generalErrorHandler } from '@/utils/error';
import { errorHelper } from 'sdk/error';

enum NOTIFICATION_TYPE {
  CUSTOM,
  FLASH,
  FLAG,
}

enum ERROR_TYPES {
  UNKNOWN,
  NETWORK,
  BACKEND,
  NOT_AUTHORIZED,
}

type ErrorActionConfig = string | Function;

type NotifyErrorProps = {
  authentication?: ErrorActionConfig;
  network?: ErrorActionConfig;
  server?: ErrorActionConfig;
  notificationOpts?: ShowNotificationOptions;
  isDebounce?: boolean;
};

type StrategyActionProps = NOTIFICATION_TYPE | Function;

type StrategyProps = {
  isDebounce?: boolean;
  condition: Function;
  action: StrategyActionProps;
  /* config below when action is NOTIFICATION_TYPE */
  message?: string;
  notificationOpts?: ShowNotificationOptions;
};

type CatchOptionsProps = NotifyErrorProps | StrategyProps[];

const AUTO_HIDE_AFTER_3_SECONDS = 3000;

const defaultNotificationOptions = {
  type: ToastType.ERROR,
  messageAlign: ToastMessageAlign.LEFT,
  fullWidth: false,
  dismissible: false,
  autoHideDuration: AUTO_HIDE_AFTER_3_SECONDS,
};

function getErrorType(error: Error) {
  if (errorHelper.isNetworkConnectionError(error)) {
    return ERROR_TYPES.NETWORK;
  }
  if (errorHelper.isLocalTimeoutError(error)) {
    return ERROR_TYPES.NETWORK;
  }
  if (errorHelper.isAuthenticationError(error)) {
    return ERROR_TYPES.NOT_AUTHORIZED;
  }
  if (errorHelper.isBackEndError(error)) {
    return ERROR_TYPES.BACKEND;
  }
  return ERROR_TYPES.UNKNOWN;
}

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
let debounceNotifyStore = {};

const getDebounceNotify = (actionName: ErrorActionConfig) => {
  if (typeof actionName === 'function') {
    return;
  }
  if (!debounceNotifyStore[actionName]) {
    debounceNotifyStore = {
      [actionName]: _.debounce(notify, 1000, {
        trailing: false,
        leading: true,
      }),
    };
  }
  return debounceNotifyStore[actionName];
};

function notifyFunc(isDebounce: boolean, actionName: ErrorActionConfig) {
  return isDebounce ? getDebounceNotify(actionName) : notify;
}

function performAction(option: StrategyProps, error: Error, ctx: any) {
  const {
    action,
    message,
    isDebounce = false,
    notificationOpts = defaultNotificationOptions,
  } = option;
  if (typeof action === 'function') {
    return action(error, ctx);
  }

  return notifyFunc(isDebounce, message || '')(
    ctx,
    action,
    message,
    notificationOpts,
    error,
  );
}

function perform(options: StrategyProps[], error: Error, ctx: any) {
  const result = options.some(opt => {
    if (opt.condition(error, ctx)) {
      performAction(opt, error, ctx);
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

  const {
    server,
    network,
    authentication,
    notificationOpts = defaultNotificationOptions,
    isDebounce = false,
  } = options;

  if (network && errorHelper.isNetworkConnectionError(error)) {
    notifyFunc(isDebounce, network)(
      ctx,
      notificationType,
      network,
      notificationOpts,
      error,
    );
    return false;
  }

  if (authentication && errorHelper.isAuthenticationError(error)) {
    return notifyFunc(isDebounce, authentication)(
      ctx,
      notificationType,
      authentication,
      notificationOpts,
      error,
    );
  }

  if (server && errorHelper.isBackEndError(error)) {
    notifyFunc(isDebounce, server)(
      ctx,
      notificationType,
      server,
      notificationOpts,
      error,
    );
    return false;
  }

  generalErrorHandler(error);
  throw error;
}

function wrapHandleError(
  originalMethod: Function,
  notificationType: NOTIFICATION_TYPE,
  options: CatchOptionsProps,
) {
  return function(this: Function, ...args: any[]) {
    try {
      const result = originalMethod.apply(this, args);

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

function decorate(
  notificationType: NOTIFICATION_TYPE,
  options: CatchOptionsProps,
): any {
  return function(target: any, propertyName: string, descriptor?: any) {
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

    if (descriptor.initializer) {
      return {
        enumerable: false,
        configurable: true,
        writable: true,
        initializer() {
          // N.B: we can't immediately invoke initializer; this would be wrong
          return wrapHandleError(
            descriptor.initializer!.call(this),
            notificationType,
            options,
          );
        },
      };
    }

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

catchError.flash = function(options: NotifyErrorProps) {
  return decorate(NOTIFICATION_TYPE.FLASH, options);
};

catchError.flag = function(options: NotifyErrorProps) {
  return decorate(NOTIFICATION_TYPE.FLAG, options);
};

export {
  catchError,
  defaultNotificationOptions,
  handleError,
  NOTIFICATION_TYPE,
  ERROR_TYPES,
  getErrorType,
  wrapHandleError,
};
