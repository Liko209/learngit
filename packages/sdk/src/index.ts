/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as service from './service';
import * as module from './module';
import * as dao from './dao';
import * as utils from './utils';
import * as api from './api';

export * from './framework';
export * from './error';
export { default as GlipTypeDictionary } from './utils/glip-type-dictionary/types';
export { default as LogControlManager } from './service/uploadLogControl/logControlManager';

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
export { sdk, service, utils, dao, api, module };
export { mainLogger } from 'foundation';
