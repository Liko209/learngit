/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-01 14:52:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { JuiIconButton } from 'jui/components/Buttons';
import { mountWithTheme } from 'shield/utils';
import { container } from 'framework';

import { Call } from '../Call';

const telephonyService = {
  makeCall: jest.fn(),
};

describe('message', () => {
  @testable
  class doCall {
    @test('should make a call if click call button [JPT-2364]')
    t1() {
      container.get = jest.fn().mockReturnValue(telephonyService);
      const wrapper = mountWithTheme(
        <Call
          id={123}
          caller={{
            phoneNumber: '123',
          }}
        />,
      );
      wrapper.find(JuiIconButton).simulate('click');
      expect(telephonyService.makeCall).toHaveBeenCalledWith('123');
    }
  }
});
