/*
* @Author: Shining (shining.miao@ringcentral.com)
* @Date: 2019-08-28 02:17:01
* Copyright © RingCentral. All rights reserved.
*/
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
//import { mountWithTheme } from 'shield/utils';
import { WarmTransferHeaderView } from '../WarmTransferHeader.View';


describe('WarmTransferHeaderView', () => {
  @testable
  class _viewMethods {
    @test('should check text if exist while pass text as props')
    t1() {
      const props = {text: '1234'};
      const wrapper = shallow(<WarmTransferHeaderView {...props} />);
      expect(wrapper.contains(props.text)).toBe(false);
    }
  }
});
