/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-25 13:21:13
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ProgressActionsView } from '../ProgressActions.View';
import { JuiIconButton } from 'jui/components/Buttons';
import { PROGRESS_STATUS } from 'sdk/module/progress';

describe('ProgressActionsView', () => {
  describe('render()', () => {
    it('Check button of the failed post in a conversation [JPT-108]', async () => {
      const props = { postStatus: PROGRESS_STATUS.FAIL, showEditAction: true };
      const Wrapper = shallow(<ProgressActionsView {...props} />);
      const JuiIconButtons = Wrapper.find(JuiIconButton);
      expect(JuiIconButtons).toHaveLength(3);
      expect(JuiIconButtons.get(0).props.tooltipTitle).toBe(
        'message.action.resendPost',
      );
      expect(JuiIconButtons.get(1).props.tooltipTitle).toBe(
        'message.action.editPost',
      );
      expect(JuiIconButtons.get(2).props.tooltipTitle).toBe(
        'message.action.deletePost',
      );
    });
    it('Should not show edit button when showEditAction is false', async () => {
      const props = { postStatus: PROGRESS_STATUS.FAIL, showEditAction: false };
      const Wrapper = shallow(<ProgressActionsView {...props} />);
      const JuiIconButtons = Wrapper.find(JuiIconButton);
      expect(JuiIconButtons).toHaveLength(2);
      expect(JuiIconButtons.get(0).props.tooltipTitle).toBe(
        'message.action.resendPost',
      );
      expect(JuiIconButtons.get(1).props.tooltipTitle).toBe(
        'message.action.deletePost',
      );
    });
  });
});
