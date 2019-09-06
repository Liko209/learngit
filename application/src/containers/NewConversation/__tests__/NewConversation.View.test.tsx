/*
 * @Author: ken.li
 * @Date: 2019-08-27 21:41:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { test, testable } from 'shield';
import { NewConversationView } from '../NewConversation.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('NewConversationView', () => {
  @testable
  class render {
    @test('should render withEscTracking when Component rendered ')
    t1() {
      const props = {
        group: {
          members: {},
        },
      };
      const Wrapper = shallow(<NewConversationView {...props} />);
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    }
  }
});
