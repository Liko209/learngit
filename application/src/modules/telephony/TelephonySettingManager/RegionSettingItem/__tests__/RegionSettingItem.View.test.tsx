/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { RegionSettingItemView } from '../RegionSettingItem.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('RegionSettingItemView', () => {
  describe('render()', () => {
    it('should contain onClose props when rendering JuiModal ', async () => {
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
      const modal = Wrapper.find(JuiModal).shallow();
      expect(modal.props().onClose).toBeTruthy();
    });
  });
});
