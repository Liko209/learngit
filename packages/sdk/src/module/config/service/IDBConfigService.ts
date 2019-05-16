/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-07 16:23:06
 * Copyright © RingCentral. All rights reserved.
 */

import { IConfigService } from './IConfigService';
import { DBKVDao } from '../../../dao';

interface IDBConfigService extends IConfigService {
  setConfigDao(dao: DBKVDao): void;
}

export { IDBConfigService };
