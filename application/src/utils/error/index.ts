/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-03 15:01:52
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'sdk';
import { ErrorParserHolder } from 'sdk/error';
import { ErrorReporterProxy } from './ErrorReporterProxy';
import { IErrorReporter } from './types';
import { getAppContextInfo } from './helper';
function generalErrorHandler(error: Error) {
  const jErr = ErrorParserHolder.getErrorParser().parse(error);
  mainLogger.error(jErr.message);
}
const errorReporter: IErrorReporter = new ErrorReporterProxy(
  process.env.NODE_ENV === 'production',
);
export { generalErrorHandler, errorReporter, getAppContextInfo };
