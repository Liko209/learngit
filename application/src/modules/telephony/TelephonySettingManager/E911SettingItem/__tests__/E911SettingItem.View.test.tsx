/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-02 15:27:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';

import { mountWithTheme } from 'shield/utils';
import { ReactWrapper, shallow } from 'enzyme';
import { JuiSettingSectionItem } from 'jui/pattern/SettingSectionItem';
import { JuiButton } from 'jui/components/Buttons';

import { E911SettingItemView } from '../E911SettingItem.View';

describe('E911SettingItemView', () => {
  @testable
  class JPT2667 {
    @test('should check i18n if show e911 setting item')
    t1() {
      const props = {
        showUserE911: 'showUserE911',
        settingItemEntity: {
          state: 0,
          openE911: jest.fn(),
        },
      };
      const wrapper: ReactWrapper = mountWithTheme(
        <E911SettingItemView {...props} />,
      );
      expect(wrapper.find(JuiSettingSectionItem).props().label).toBe(
        'setting.phone.general.e911Setting.e911Address',
      );

      expect(wrapper.find(JuiSettingSectionItem).props().description).toBe(
        'setting.phone.general.e911Setting.e911AddressDesc showUserE911',
      );
    }

    @test('should open E911 if click edit button')
    t2() {
      const props = {
        showUserE911: 'showUserE911',
        openE911: jest.fn(),
        settingItemEntity: {
          state: 0,
        },
      };
      const wrapper = shallow(<E911SettingItemView {...props} />);
      wrapper.find(JuiButton).simulate('click');
      expect(props.openE911).toHaveBeenCalled();
    }
  }
});
