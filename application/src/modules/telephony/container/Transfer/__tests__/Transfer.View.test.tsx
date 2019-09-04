/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
// import { mountWithTheme } from 'shield/utils';
import { TransferView } from '../Transfer.View';
import { JuiFabButton } from 'jui/components/Buttons';

describe('TransferView', () => {
  @testable
  class _viewMethods {
    @test('should not transfer if invalid number [JPT-2760]')
    t1() {
      const props = { transferNumber: '', transferCall: () => {} };
      const wrapper = shallow(<TransferView {...props} />);
      expect(wrapper.find(JuiFabButton).get(0).props.disabled).toBe(true);
    }

    @test('should transfer if valid number [JPT-2760]')
    t2() {
      const props = { transferNumber: '123', transferCall: () => {} };
      const wrapper = shallow(<TransferView {...props} />);
      expect(wrapper.find(JuiFabButton).get(0).props.disabled).toBe(false);
    }
  }
});
