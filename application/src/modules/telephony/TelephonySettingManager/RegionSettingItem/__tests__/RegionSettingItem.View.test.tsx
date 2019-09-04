/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { RegionSettingItemView } from '../RegionSettingItem.View';
import { JuiModal } from 'jui/components/Dialog';
import { test, testable } from 'shield';

jest.mock('@/containers/Notification');

describe('RegionSettingItemView', () => {
  @testable
  class render {
    @test('should render withEscTracking when Component rendered [JPT-2896]')
    t1() {
      const props = {
        settingItemEntity: {
          value: {
            countryInfo: { name: '', callingCode: '123' },
          },
          state: { dialogOpen: true },
        },
        currentCountryInfo: { isoCode: '' },
      };
      const Wrapper = shallow(<RegionSettingItemView {...props} />);
      Wrapper.setState({
        dialogOpen: true,
      });
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    }
  }
});
