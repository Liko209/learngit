/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-07 15:51:00
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { DialpadView } from '../Dialpad.View';
import { JuiDialpadBtn } from 'jui/pattern/Dialer';
import v4 from 'uuid';

describe('DialpadView', () => {
  describe('render', () => {
    it('should render 1 JuiDialpadBtn', () => {
      const props = {
        showMinimized: false,
        maximize: () => {},
        timing: '',
        id: v4(),
        canUseTelephony: true,
        startMinimizeAnimation: false,
        isConference: false,
      };
      const wrapper = shallow(<DialpadView {...props} />);
      expect(wrapper.find(JuiDialpadBtn).length).toBe(1);
    });

    it('should render 0 JuiDialpadBtn', () => {
      const props = {
        showMinimized: false,
        maximize: () => {},
        timing: '',
        id: v4(),
        canUseTelephony: false,
        startMinimizeAnimation: false,
        isConference: false,
      };
      const wrapper = shallow(<DialpadView {...props} />);
      expect(wrapper.find(JuiDialpadBtn).length).toBe(0);
    });
  });
});
