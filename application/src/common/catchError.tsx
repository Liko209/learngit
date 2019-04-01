import { ToastType, ToastMessageAlign } from '@/containers/ToastWrapper/Toast/types';
import { Notification, ShowNotificationOptions } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';

type ErrorActionConfig = string | Function;

type CatchErrorProps = {
  network?: ErrorActionConfig;
  server?: ErrorActionConfig;
  notificationOpts?: ShowNotificationOptions;
};

const defaultOptions = {
  type: ToastType.ERROR,
  messageAlign: ToastMessageAlign.LEFT,
  fullWidth: false,
  dismissible: false,
};

enum NOTIFICATION_TYPE {
  FLASH,
  FLAG,
}

function notificate(
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

function handleError(
  catchConf: CatchErrorProps,
  notificationType: NOTIFICATION_TYPE,
  error: any,
  ctx: any,
) {
  const { network, server, notificationOpts = defaultOptions } = catchConf;
  if (network && errorHelper.isNetworkConnectionError(error)) {
    return notificate(ctx, notificationType, network, notificationOpts, error);
  }

  if (server && errorHelper.isBackEndError(error)) {
    return notificate(ctx, notificationType, server, notificationOpts, error);
  }

  throw error;
}

class CatchError {
  static handle(notificationType: NOTIFICATION_TYPE, catchConf: CatchErrorProps) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const oridinalMethod = descriptor.value;

      descriptor.value = function (...args: any[]) {
        try {
          const result = oridinalMethod.apply(this, args);

          // if method is asynchronous
          if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
            return result.catch((error: any) => {
              handleError(catchConf, notificationType, error, this);
            });
          }

          return result;
        } catch (error) {
          handleError(catchConf, notificationType, error, this);
        }
      };

      return descriptor;
    };
  }

  static flash(catchConf: CatchErrorProps) {
    return this.handle(NOTIFICATION_TYPE.FLASH, catchConf);
  }

  static flag(catchConf: CatchErrorProps) {
    return this.handle(NOTIFICATION_TYPE.FLAG, catchConf);
  }
}

export { CatchError };
