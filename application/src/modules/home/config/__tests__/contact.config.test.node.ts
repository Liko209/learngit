/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-22 14:28:47
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { jupiter } from 'framework/Jupiter';

import { config } from '../contact.config';

describe('contact router config', () => {
  @testable
  class JPT2829 {
    @test(
      'should show the last seen page under Contacts if the user returns from other tabs[JPT-2829]',
    )
    async t1() {
      const contactService = {
        getCurrentUrl: jest.fn(),
      };
      jupiter.get = jest.fn().mockReturnValue(contactService);
      const nav = await config.nav!();
      nav.url();
      expect(contactService.getCurrentUrl).toHaveBeenCalled();
    }
  }
});
