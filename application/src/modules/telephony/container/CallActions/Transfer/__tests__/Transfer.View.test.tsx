/*
* @Author: Shining (shining.miao@ringcentral.com)
* @Date: 2019-08-21 13:58:11
* Copyright © RingCentral. All rights reserved.
*/
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
//import { mountWithTheme } from 'shield/utils';
import { TransferView } from '../Transfer.View';


describe('TransferView', () => {
  @testable
  class _viewMethods {
    @test('should check text if exist while pass text as props')
    t1() {
      const props = {text: '1234'};
      const wrapper = shallow(<TransferView {...props} />);
      expect(wrapper.contains(props.text)).toBe(false);
    }
  }
});
