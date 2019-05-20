/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-07 15:51:00
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { DialerTitleBarView } from '../DialerTitleBar.View';
import { JuiTitleBar } from 'jui/pattern/Dialer';

describe('DialerTitleBar', () => {
  describe('render', () => {
    const newCall = 'New Call';
    it('should have label: New Call', () => {
      const props = {
        isDialer: true,
        t: (str) => (str === 'dialer.newCall' ? newCall : null),
        tReady: true,
        timing: 'Connecting',
      };
      const wrapper = shallow(<DialerTitleBarView {...props} />);
      expect(wrapper.find(JuiTitleBar).length).toBe(1);
      expect(wrapper.find(JuiTitleBar).props().label).toBe(newCall);
    });
  });
});
