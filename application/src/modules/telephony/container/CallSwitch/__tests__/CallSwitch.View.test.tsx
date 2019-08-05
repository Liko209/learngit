/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-26 16:13:25
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
// import { mountWithTheme } from 'shield/utils';
import { CallSwitchView } from '../CallSwitch.View';

describe('CallSwitchView', () => {
  @testable
  class render {
    @test('should check text if exist while pass text as props [JPT-2524]')
    t1() {
      const props = { displayName: 'Shining' };
      const wrapper = shallow(<CallSwitchView {...props} />);
      expect(wrapper.get(0).props.message).toBe('telephony.switchCall.content');
    }
  }
});
