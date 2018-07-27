/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as service from './service';
import * as dao from './dao';
import * as api from './api';
import * as utils from './utils';

export * from './framework';
export { default as GlipTypeDictionary } from './utils/glip-type-dictionary/types';
export { default as LogControlManager } from './service/uploadLogControl/logControlManager';

import Sdk from './Sdk';
import { container } from './container';
import { registerConfigs } from './registerConfigs';

container.registerAll(registerConfigs);
const sdk = container.get(Sdk.name);

export default sdk;
export { sdk as Sdk, service, dao, api, utils };
