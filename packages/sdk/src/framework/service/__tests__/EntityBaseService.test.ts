/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../EntityBaseService';
import { BaseModel } from '../../../models';
import { ControllerBuilder } from '../../controller/impl/ControllerBuilder';

describe('EntityBaseService', () => {
  describe('getControllerBuilder()', () => {
    it('should return controller builder instance', () => {
      const service = new EntityBaseService<BaseModel>();
      const result = service.getControllerBuilder();
      const isInstance = result instanceof ControllerBuilder;
      expect(isInstance).toBe(true);
    });
  });
});
