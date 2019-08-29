/*
 * @Author: ken.li
 * @Date: 2019-08-28 09:58:24
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { GroupSettingsView } from '../GroupSettings.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('GroupSettingsView', () => {
  describe('render()', () => {
    it('should contain onClose props when rendering JuiModal ', async () => {
      const props = {};
      const Wrapper = shallow(<GroupSettingsView {...props} />);
      const modal = Wrapper.find(JuiModal).shallow();
      expect(modal.props().onClose).toBeTruthy();
    });
  });
});
