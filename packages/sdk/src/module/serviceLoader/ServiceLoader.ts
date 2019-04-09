/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-04 23:31:31
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from '../../framework';
import { container } from '../../container';

class ServiceLoader {
  static getInstance<T extends AbstractService>(serviceName: string): T {
    return container.get(serviceName);
  }
}

export { ServiceLoader };
