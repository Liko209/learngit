/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
// import { mountWithTheme } from 'shield/utils';
import { AskFirstView } from '../AskFirst.View';
import { JuiFabButton } from 'jui/components/Buttons';

describe('AskFirstView', () => {
  @testable
  class _viewMethods {
    @test('should not transfer if invalid number [JPT-2760]')
    t1() {
      const props = { transferNumber: '', transferCall: () => {} };
      const wrapper = shallow(<AskFirstView {...props} />);
      expect(wrapper.find(JuiFabButton).get(0).props.disabled).toBe(true);
    }

    @test('should transfer if valid number [JPT-2760]')
    t2() {
      const props = { transferNumber: '123', transferCall: () => {} };
      const wrapper = shallow(<AskFirstView {...props} />);
      expect(wrapper.find(JuiFabButton).get(0).props.disabled).toBe(false);
    }
  }
});
