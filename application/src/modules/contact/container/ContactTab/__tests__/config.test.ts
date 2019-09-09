/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-09-05 09:54:26
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import {
  CONTACT_TAB_TYPE,
  ContactFocHandler,
} from '@/store/handler/ContactFocHandler';
import { SectionTabs } from '@/modules/common/container/Layout';
import { jupiter } from 'framework/Jupiter';

import { ContactTabs } from '../config';

jest.mock('@/store/handler/ContactFocHandler');

describe('ContactTabs config', () => {
  @testable
  class getFoc {
    @test('should get foc if show the all contact list')
    t1() {
      (ContactTabs as SectionTabs).sections[0].tabs[0].createHandler('123');
      expect(ContactFocHandler).toHaveBeenCalledWith(
        CONTACT_TAB_TYPE.ALL,
        '123',
      );
    }

    @test('should get foc if show the company contact list')
    t2() {
      (ContactTabs as SectionTabs).sections[0].tabs[1].createHandler('123');
      expect(ContactFocHandler).toHaveBeenCalledWith(
        CONTACT_TAB_TYPE.GLIP_CONTACT,
        '123',
      );
    }
  }

  @testable
  class filter {
    @test('should init the filter key if show the all/company contact list')
    t1() {
      const store = {
        filterKey: '123',
      };
      jupiter.get = jest.fn().mockImplementation(() => store);
      const filter1 = (ContactTabs as SectionTabs).sections[0].tabs[0].filter;
      const key1 = filter1 && filter1.initFilterKey && filter1.initFilterKey();
      expect(key1).toBe('123');

      const filter2 = (ContactTabs as SectionTabs).sections[0].tabs[1].filter;
      const key2 = filter2 && filter2.initFilterKey && filter2.initFilterKey();
      expect(key2).toBe('123');
    }

    @test('should set the filter key if search key change')
    t2() {
      const store = {
        setFilterKey: jest.fn(),
      };
      jupiter.get = jest.fn().mockImplementation(() => store);
      const filter1 = (ContactTabs as SectionTabs).sections[0].tabs[0].filter;
      filter1 && filter1.onChange && filter1.onChange('123');
      expect(store.setFilterKey).toHaveBeenCalledWith('123');

      const filter2 = (ContactTabs as SectionTabs).sections[0].tabs[1].filter;
      filter2 && filter2.onChange && filter2.onChange('123');
      expect(store.setFilterKey).toHaveBeenCalledWith('123');
    }
  }
});
