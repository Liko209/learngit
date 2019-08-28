/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-03 15:01:52
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation/log';
import { ErrorParserHolder } from 'sdk/error';
import { ErrorReporterProxy } from './ErrorReporterProxy';
import { IErrorReporter } from './types';
import { getAppContextInfo, getApplicationInfo } from './helper';
import { isProductionVersion, isStage, isHotfix } from '@/common/envUtils';
import { EnvConfig } from 'sdk/module/env/config';
import { CrashManager } from 'sdk/module/crash';

function generalErrorHandler(error: Error) {
  const jErr = ErrorParserHolder.getErrorParser().parse(error);
  mainLogger.error(jErr.message);
  CrashManager.getInstance().onCrash();
}
const disable = (process.env.NODE_ENV === 'test' || EnvConfig.getIsRunningE2E());
const errorReporter: IErrorReporter = new ErrorReporterProxy(
  !disable && (isProductionVersion || isStage || isHotfix),
);
export {
  generalErrorHandler,
  errorReporter,
  getAppContextInfo,
  getApplicationInfo,
};
