/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:13:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { JuiCustomStatus, JuiCustomInput } from 'jui/pattern/CustomStatus';
import { JuiModal } from 'jui/components/Dialog';
import { CustomStatusView } from '../CustomStatus.View';

const props = {
  value: 'value',
  menuItems: [
    {
      emoji: ':sunflower:',
      status: 'customstatus.items.item1',
    },
  ],
  showCloseBtn: true,
  colons: ':hello:',
  handleInputValueChange: jest.fn(),
  onStatusItemClick: jest.fn(),
  isShowMenuList: true,
  handleInputFocus: jest.fn(),
  placeHolder: 'Share custom status',
};
describe('CustomStatusView', () => {
  @testable
  class render {
    @test(
      'should check the maximum text of the custom status when not more than 40 [JPT-2820]',
    )
    t1() {
      const wrapper = shallow(<JuiCustomStatus {...props} />);
      expect(
        wrapper
          .find(JuiCustomInput)
          .at(0)
          .props(),
      ).toMatchObject({
        inputProps: { maxLength: 40 },
      });
    }
    @test(
      'should check the place holder of share custom status when placeholder is Share custom status  [JPT-2830]',
    )
    t2() {
      const wrapper = shallow(<JuiCustomStatus {...props} />);
      expect(
        wrapper
          .find(JuiCustomInput)
          .at(0)
          .props(),
      ).toMatchObject({
        placeholder: 'Share custom status',
      });
    }
    @test('should render withEscTracking when Component rendered ')
    t3() {
      const Wrapper = shallow(<CustomStatusView open {...props} />);
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    }
  }
});
