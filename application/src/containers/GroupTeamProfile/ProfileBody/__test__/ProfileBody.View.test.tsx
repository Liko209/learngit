/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-29 09:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { ProfileBodyView } from '../ProfileBody.View';
import { CONVERSATION_TYPES } from '@/constants';
import { JuiGroupProfileMessageBtn } from 'jui/pattern/GroupTeamProfile';
import { goToConversation } from '../../../../common/goToConversation';

const dismiss = jest.fn();
describe('ProfileBodyView', () => {
  it('OnMessageClick should be called while jump to message', async () => {
    const wrapper = shallow(
      <ProfileBodyView
        isShowMessageButton={true}
        name="dda"
        type={CONVERSATION_TYPES.TEAM}
        id={47988738}
        dismiss={dismiss}
      />,
    );
    expect(wrapper.find(JuiGroupProfileMessageBtn)).toHaveLength(1);
    wrapper.find(JuiGroupProfileMessageBtn).simulate('click');
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(await goToConversation(47988738)).toBe(true);
  });
});
