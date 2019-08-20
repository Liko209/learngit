/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 14:26:31
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { container } from 'framework/ioc';

import { openSearch } from '../openSearch';

describe('global search hot key', () => {
  @testable
  class openGlobalSearch {
    @test('should be open search if cmd+f or ctrl+f')
    t1() {
      const service = {
        openGlobalSearch: jest.fn(),
      };
      container.get = jest.fn().mockImplementation(() => service);
      const ret = openSearch();
      expect(service.openGlobalSearch).toHaveBeenCalled();
      expect(ret).toBeFalsy();
    }
  }
});
