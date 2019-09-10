/*
 * @Author: ken.li
 * @Date: 2019-08-28 10:24:26
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { test, testable } from 'shield';
import { UploadRecentLogsComponent } from '../UploadRecentLogs.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('UploadRecentLogsComponent', () => {
  @testable
  class render {
    @test('should render withEscTracking when Component rendered ')
    t1() {
      const props = {
        onSendFeedbackDone: () => {},
      };
      const Wrapper = shallow(<UploadRecentLogsComponent {...props} />);
      const modal = Wrapper.shallow().find(JuiModal);
      expect(modal.props().onEscTracking).toBeTruthy();
    }
  }
});
