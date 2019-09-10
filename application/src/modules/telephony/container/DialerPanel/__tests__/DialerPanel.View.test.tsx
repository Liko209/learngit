/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-08-25 22:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { DialerPanelView } from '../DialerPanel.View';

describe('DialerPanelView', () => {
  describe('render', () => {
    it('The content of transfer call page is correct [JPT-2758]', () => {
      const props = {
        makeCall: () => {},
        backToDialerFromTransferPage: () => {},
        onAfterDialerOpen: () => {},
        displayCallerIdSelector: false,
        isTransferPage: true,
      };
      const wrapper = shallow(<DialerPanelView {...props} />);
      expect(wrapper.prop('CallActionBtn').length).toBe(3);
      expect(wrapper.prop('displayCallerIdSelector')).toBeFalsy();
    });
  });
});
