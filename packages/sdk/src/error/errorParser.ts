/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 14:13:12
 * Copyright © RingCentral. All rights reserved.
 */

import { ErrorParserHolder } from './ErrorParserHolder';
ErrorParserHolder.init();
const errorParser = ErrorParserHolder.getErrorParser();
export {
  errorParser,
};
