/*
 * @Author: Paynter Chen
 * @Date: 2019-03-22 13:11:21
 * Copyright © RingCentral. All rights reserved.
 */
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import * as Sentry from '@sentry/browser';
import pkg from '../../../package.json';
import { IErrorReporter, ContextInfo } from './types';
const DSN = 'https://810a779037204886beeced1c4bd7fbba@sentry.io/1419520';

export class SentryErrorReporter implements IErrorReporter {
  init = async () => {
    const { deployedVersion } = await fetchVersionInfo();
    Sentry.init({
      dsn: DSN,
      debug: false,
      environment: window.jupiterElectron ? 'Electron' : 'Browser',
      // release format: {project-name}@{version}
      // https://docs.sentry.io/workflow/releases/?platform=browsernpm
      release: `jupiter@${deployedVersion || pkg.version}`,
    });
  }

  report = (error: Error) => {
    Sentry.captureException(error);
  }

  setContextInfo = (contextInfo: ContextInfo) => {
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
