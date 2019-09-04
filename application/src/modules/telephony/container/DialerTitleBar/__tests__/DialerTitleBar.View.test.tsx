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
    it('should have label: New Call', () => {
      const newCall = 'New Call';
      const props = {
        isTransfer: false,
        isDialer: true,
        isForward: false,
        canCompleteTransfer: true,
        t: (str: string) => (str === 'dialer.newCall' ? newCall : null),
        tReady: true,
        timing: 'Connecting',
        title: newCall,
      };
      const wrapper = shallow(<DialerTitleBarView {...props} />);
      expect(wrapper.find(JuiTitleBar).length).toBe(1);
      expect(wrapper.find(JuiTitleBar).props().label).toBe(newCall);
    });

    it('should have label: Transfer [JPT-2758]', () => {
      const transfer = 'Transfer';
      const props = {
        isTransfer: true,
        isDialer: true,
        isForward: false,
        canCompleteTransfer: true,
        t: (str: string) =>
          str === 'telephony.action.transfer' ? transfer : null,
        tReady: true,
        timing: 'Connecting',
      };
      const wrapper = shallow(<DialerTitleBarView {...props} />);
      expect(wrapper.find(JuiTitleBar).length).toBe(1);
      expect(wrapper.find(JuiTitleBar).props().label).toBe(transfer);
    });

    it('should have label: Transferring [JPT-2768]', () => {
      const transferring = 'Transferring';
      const props = {
        isTransfer: true,
        isDialer: true,
        isForward: false,
        canCompleteTransfer: false,
        t: (str: string) =>
          str === 'telephony.action.transferring' ? transferring : null,
        tReady: true,
        timing: 'Connecting',
      };
      const wrapper = shallow(<DialerTitleBarView {...props} />);
      expect(wrapper.find(JuiTitleBar).length).toBe(1);
      expect(wrapper.find(JuiTitleBar).props().label).toBe(transferring);
    });
  });
});
