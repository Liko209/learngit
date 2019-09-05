/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-04 15:07:18
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';

import { ContactStore } from '../ContactStore';

describe('ContactStore', () => {
  @testable
  class setCurrentUrl {
    @test('should get current url if set current url')
    t1() {
      const contactStore = new ContactStore();

      contactStore.setCurrentUrl('123');
      expect(contactStore.currentUrl).toBe('123');
    }
  }

  @testable
  class setFilterKey {
    @test('should set search key if filter change')
    t1() {
      const contactStore = new ContactStore();

      contactStore.setFilterKey('123');
      expect(contactStore.filterKey).toBe('123');
    }
  }
});
