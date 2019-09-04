/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { FileNameEditDialogView } from '../FileNameEditDialog.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('CreateTeamView', () => {
  @testable
  class render {
    @test('should render withEscTracking when Component rendered ')
    t4() {
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
      const Wrapper = shallow(<FileNameEditDialogView {...props} />);
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    }
  }
});
