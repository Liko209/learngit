/*
 * @Author: Wayne Zhou
 * @Date: 2018-12-07 15:03:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ConversationInitialPostView } from '../ConversationInitialPost.View';
import { shallow } from 'enzyme';
import { CONVERSATION_TYPES } from '@/constants';
import { personFactory } from 'sdk/__tests__/factories';
import { JuiConversationInitialPostBody } from 'jui/pattern/ConversationInitialPost';

describe('ConversationInitialPostView', () => {
  describe('render()', () => {
    const baseProps = {
      id: 1,
      displayName: 'some',
      groupType: CONVERSATION_TYPES.ME,
      groupDescription: 'text',
      creator: personFactory.build({
        id: 11,
        first_name: 'steve',
        last_name: 'chen',
        email: 'steve.chen@ringcentral.com',
      }),
      creatorGroupId: 123,
      t: p => p,
      isTeam: false,
    };
    it('should not render initialPostBody when notEmpty is true [JPT-478]', () => {
      const notEmpty = true;
      const wrapper = shallow(
        <ConversationInitialPostView {...baseProps} notEmpty={notEmpty} />,
      );
      expect(wrapper.find(JuiConversationInitialPostBody)).toHaveLength(0);
    });

    it('should render initialPostBody when notEmpty is false [JPT-478]', () => {
      const notEmpty = false;
      const wrapper = shallow(
        <ConversationInitialPostView {...baseProps} notEmpty={notEmpty} />,
      );
      expect(wrapper.find(JuiConversationInitialPostBody)).toHaveLength(1);
    });
  });
});
