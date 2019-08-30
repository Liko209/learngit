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
          type={BUTTON_TYPE.ICON}
        />,
      );
      wrapper.find(JuiIconButton).simulate('click');
      expect(telephonyService.directCall).toHaveBeenCalledWith('123');
    }
  }

  @testable
  class JPT2459 {
    @test(
      'should the tooltip of the call icon to be "Call" when hover the button [JPT-2459]',
    )
    t1() {
      const person = { id: 1 } as any;
      const wrapper = mountWithTheme(
        <Call id={123} person={person} type={BUTTON_TYPE.ICON} />,
      );
      expect(wrapper.find(JuiIconButton).props().tooltipTitle).toBe(
        'common.call',
      );
    }
  }
});
