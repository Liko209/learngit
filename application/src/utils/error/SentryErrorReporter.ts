/*
 * @Author: Paynter Chen
 * @Date: 2019-03-22 13:11:21
 * Copyright © RingCentral. All rights reserved.
 */
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import * as Sentry from '@sentry/browser';
import pkg from '../../../package.json';
import { IErrorReporter, UserContextInfo } from './types';
import { isProductionVersion, JUPITER_ENV } from '@/common/envUtils';
const DSN = 'https://810a779037204886beeced1c4bd7fbba@sentry.io/1419520';
const DSN_PRODUCTION =
  'https://684e586feb974bb895d0a98411a92873@sentry.io/1430043';

export class SentryErrorReporter implements IErrorReporter {
  init = async () => {
    const { deployedVersion } = await fetchVersionInfo();
    Sentry.init({
      dsn: isProductionVersion ? DSN_PRODUCTION : DSN,
      debug: false,
      environment: JUPITER_ENV,
      // release format: {project-name}@{version}
      // https://docs.sentry.io/workflow/releases/?platform=browsernpm
      release: `web@${deployedVersion || pkg.version}`,
    });
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
      const Config = require('@/config').default;
      scope.setExtra('env', Config.getEnv());
    });
  }
}
