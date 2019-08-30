/*
 * @Author: Paynter Chen
 * @Date: 2019-03-22 13:11:21
 * Copyright © RingCentral. All rights reserved.
 */
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import * as Sentry from '@sentry/browser';
import { Event } from '@sentry/types';
import { IErrorReporter, UserContextInfo, ErrorFilterType } from './types';
import { JUPITER_ENV } from '@/common/envUtils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import _ from 'lodash';

const ENV_DSN_MAP = {
  development: 'https://810a779037204886beeced1c4bd7fbba@sentry.io/1419520',
  production: 'https://684e586feb974bb895d0a98411a92873@sentry.io/1430043',
  public: 'https://189257426b7043da8995ac8d2c217298@sentry.io/1448026',
};

export class SentryErrorReporter implements IErrorReporter {
  init = async () => {
    const { deployedVersion } = await fetchVersionInfo();
    Sentry.init({
      dsn: ENV_DSN_MAP[JUPITER_ENV] || ENV_DSN_MAP['development'],
      debug: false,
      release: deployedVersion,
      beforeSend: this.beforeSend,
    });
    if (
      window.jupiterElectron &&
      window.jupiterElectron.getElectronVersionInfo
    ) {
      const electronVersionInfo = window.jupiterElectron.getElectronVersionInfo();
      electronVersionInfo &&
        Sentry.configureScope(scope => {
          scope.setTag(
            'desktopRelease',
            electronVersionInfo.electronAppVersionNumber,
          );
        });
    }
  };

  report = (error: Error) => {
    Sentry.captureException(error);
  };

  setUserContextInfo = (contextInfo: UserContextInfo) => {
    Sentry.configureScope((scope: Sentry.Scope) => {
      scope.setUser({
        id: String(contextInfo.id),
        username: contextInfo.username,
        email: contextInfo.email,
      });
      scope.setTag('env', contextInfo.env);
    });
  };

  beforeSend = async (event: Event) => {
    const permissionService = ServiceLoader.getInstance<PermissionService>(
      ServiceConfig.PERMISSION_SERVICE,
    );
    const errorFilter = (await permissionService.getFeatureFlag(
      UserPermissionType.SENTRY_ERROR_FILTER,
    )) as ErrorFilterType[];
    const isMatched = errorFilter.find(
      (item: ErrorFilterType) =>
        this._matchTags(item, event) && this._matchMessages(item, event),
    );
    return isMatched ? null : event;
  };
  private _matchTags(item: ErrorFilterType, event: Event) {
    const tags = item.tags;
    return (
      !tags ||
      Object.keys(tags).every(
        key => tags[key] === (event.tags && event.tags[key]),
      )
    );
  }
  private _matchMessages(item: ErrorFilterType, event: Event) {
    const errorMessages = (
      (event.exception && event.exception.values) ||
      []
    ).map(item => item.value);
    if (!item.messages || !errorMessages.length) {
      return false;
    }
    return !!_.intersectionWith(
      item.messages,
      errorMessages,
      (message: string, error: string) => {
        return !!error.startsWith(message);
      },
    ).length;
  }
}
