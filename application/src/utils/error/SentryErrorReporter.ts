/*
 * @Author: Paynter Chen
 * @Date: 2019-03-22 13:11:21
 * Copyright © RingCentral. All rights reserved.
 */
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import * as Sentry from '@sentry/browser';
import { IErrorReporter, UserContextInfo } from './types';
import { JUPITER_ENV } from '@/common/envUtils';

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
    });
    if (
      window.jupiterElectron &&
      window.jupiterElectron.getElectronVersionInfo
    ) {
      const electronAppVersionNumber = window.jupiterElectron.getElectronVersionInfo();
      electronAppVersionNumber &&
        Sentry.configureScope(scope => {
          scope.setTag('desktopRelease', electronAppVersionNumber);
        });
    }
  }

  report = (error: Error) => {
    Sentry.captureException(error);
  }

  setUserContextInfo = (contextInfo: UserContextInfo) => {
    Sentry.configureScope((scope: Sentry.Scope) => {
      scope.setUser({
        id: String(contextInfo.id),
        username: contextInfo.username,
        email: contextInfo.email,
      });
      scope.setTag('env', contextInfo.env);
    });
  }
}
