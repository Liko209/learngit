/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-01 14:52:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { JuiIconButton } from 'jui/components/Buttons';
import { mountWithTheme } from 'shield/utils';
import { container } from 'framework/ioc';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { Call } from '../Call';

const telephonyService = {
  directCall: jest.fn(),
};

describe('Call button', () => {
  @testable
  class doCall {
    @test('should make a call if click call button [JPT-2878]')
    t1() {
      container.get = jest.fn().mockReturnValue(telephonyService);
      const wrapper = mountWithTheme(
        <Call id={123} phoneNumber={'123'} type={BUTTON_TYPE.ICON} />,
      );
      wrapper.find(JuiIconButton).simulate('click');
      expect(telephonyService.directCall).toHaveBeenCalledWith('123');
    }
  }
});
