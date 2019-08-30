/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ConvertToTeamView } from '../ConvertToTeam.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('ConvertToTeamView', () => {
  describe('render()', () => {
    it('should contain onClose props when rendering JuiModal ', async () => {
      const props = {};
      const Wrapper = shallow(<ConvertToTeamView {...props} />);
      const modal = Wrapper.find(JuiModal).shallow();
      expect(modal.props().onClose).toBeTruthy();
    });
  });
});
