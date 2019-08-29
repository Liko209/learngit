/*
 * @Author: ken.li
 * @Date: 2019-08-28 10:24:26
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { UploadRecentLogsComponent } from '../UploadRecentLogs.View';
import { JuiModal } from 'jui/components/Dialog';

jest.mock('@/containers/Notification');

describe('UploadRecentLogsComponent', () => {
  describe('render()', () => {
    it('should contain onClose props when rendering JuiModal ', async () => {
      const props = {
        onSendFeedbackDone: () => {},
      };
      const Wrapper = shallow(<UploadRecentLogsComponent {...props} />);
      const modal = Wrapper.find(JuiModal).shallow();
      expect(modal.props().onClose).toBeTruthy();
    });
  });
});
