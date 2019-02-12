/*
 * @Author: Wayne Zhou
 * @Date: 2018-12-07 15:03:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ConversationInitialPostView } from '../ConversationInitialPost.View';
import { shallow } from 'enzyme';
import { CONVERSATION_TYPES } from '@/constants';
import { JuiConversationPageInit } from 'jui/pattern/EmptyScreen';
import PersonModel from '@/store/models/Person';

describe('ConversationInitialPostView', () => {
  describe('render()', () => {
    const baseProps = {
      id: 1,
      displayName: 'some',
      groupType: CONVERSATION_TYPES.ME,
      groupDescription: 'text',
      userDisPlayName: 'a',
      t: (p: any) => p,
      creator: {} as PersonModel,
      tReady: {},
      isTeam: false,
      createTime: 1531726169129,
      isAllHandsTeam: false,
    };
    it('should not render initialPostBody when notEmpty is true [JPT-478]', () => {
      const notEmpty = true;
      const wrapper = shallow(
        <ConversationInitialPostView {...baseProps} notEmpty={notEmpty} />,
      );
      expect(wrapper.find(JuiConversationPageInit)).toHaveLength(0);
    });

    it('should render initialPostBody when notEmpty is false [JPT-478]', () => {
      const notEmpty = false;
      const wrapper = shallow(
        <ConversationInitialPostView {...baseProps} notEmpty={notEmpty} />,
      );
      expect(wrapper.find(JuiConversationPageInit)).toHaveLength(1);
    });
  });
});
