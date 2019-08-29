/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { EditProfileView } from '../EditProfile.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('EditProfileView', () => {
  describe('render()', () => {
    it('should contain onClose props when rendering JuiModal ', async () => {
      const props = {
        canEditFileName: true,
        newFileName: 'string',
        updateNewFileName: (newFileName: string) => null,
        item: {},
        group: {},
        fileNameRemoveSuffix: 'test',
        isLoading: false,
        handleEditFileName: () => null,
      };
      const Wrapper = shallow(<EditProfileView {...props} />);
      const modal = Wrapper.find(JuiModal).shallow();
      expect(modal.props().onClose).toBeTruthy();
    });
  });
});
