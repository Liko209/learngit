/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-09-02 09:50:52
 * Copyright © RingCentral. All rights reserved.
 */
import { mockGlobalValue } from 'shield/application';
import { test, testable } from 'shield';

import { CallViewModel } from '../Call.ViewModel';

describe('CallViewModel', () => {
  @testable
  class isMe {
    @test('should not show call button when is me')
    @mockGlobalValue(123)
    t1() {
      const vm = new CallViewModel({ id: 123 });
      expect(vm.isMe).toBeTruthy();
    }
  }
});
