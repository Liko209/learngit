/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 12:56:15
 * Copyright © RingCentral. All rights reserved.
 */
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import * as Raven from 'raven-js';
import pkg from '../../../package.json';
import { IErrorReporter } from './types';
const DSN =
  'http://147a9c392d9640e0972a96f29363b44d@ec2-13-124-226-35.ap-northeast-2.compute.amazonaws.com/15';

export class RavenErrorReporter implements IErrorReporter {
  init = async () => {
    const { deployedVersion } = await fetchVersionInfo();
    Raven.config(DSN, {
      debug: false,
      // release format: {project-name}@{version}
      // https://docs.sentry.io/workflow/releases/?platform=browsernpm
      release: `jupiter@${deployedVersion || pkg.version}`,
    }).install();
  }

  report = (error: Error) => {
    Raven.captureException(error);
  }

  setUser = (user: { id: number; companyId: number }) => {
    Raven.setUserContext(user);
  }
}
