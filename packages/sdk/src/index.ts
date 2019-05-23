/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as service from './service';
import * as dao from './dao';
import * as utils from './utils';
import * as api from './api';
import * as error from './error';

export * from './framework';
export {
  default as GlipTypeDictionary,
} from './utils/glip-type-dictionary/types';
export { LogControlManager } from './service/uploadLogControl';

import Sdk from './Sdk';
import { container } from './container';
import { registerConfigs } from './registerConfigs';

registerConfigs.classes.forEach(config => container.registerClass(config));
// registerConfigs.asyncClasses.forEach(config => container.registerAsyncClass(config));
registerConfigs.constants.forEach(config =>
  container.registerConstantValue(config),
);

const sdk: Sdk = container.get(Sdk.name);
export { sdk as Sdk };
export { sdk, service, utils, dao, api, error };
export {
  mainLogger,
  ILogger,
  dataAnalysis,
  logManager,
  SessionManager,
  DateFormatter,
} from 'foundation';
