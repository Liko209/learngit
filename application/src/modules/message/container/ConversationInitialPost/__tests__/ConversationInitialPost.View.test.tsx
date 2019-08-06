/*
 * @Author: Wayne Zhou
 * @Date: 2018-12-07 15:03:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ConversationInitialPostView } from '../ConversationInitialPost.View';
import { shallow, mount } from 'enzyme';
import { CONVERSATION_TYPES } from '@/constants';
import { JuiConversationPageInit } from 'jui/pattern/EmptyScreen';
import PersonModel from '@/store/models/Person';
import { ThemeProvider } from 'styled-components';
import { theme } from 'shield/utils';

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
      createTime: {
        get: () => 1531726169129,
      },
      isCompanyTeam: false,
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

  describe("Check the first post_Initial view of a new conversation after it's created [JPT-237]", () => {
    const displayName = 'facebook';
    const createTime = 1531726169129;
    const creator = { userDisplayName: 'Wayne zhou' } as PersonModel;

    const baseProps = {
      creator,
      displayName,
      createTime: {
        get: () => createTime,
      },
      id: 1,
      groupType: CONVERSATION_TYPES.ME,
      groupDescription: 'text',
      userDisPlayName: 'a',
      t: (text: string, object: any) => {
        const args = object ? object.date : '';
        return args ? `${args} ${text}` : text;
      },
      tReady: {},
      isTeam: true,
      isCompanyTeam: true,
      notEmpty: true,
    };

    it('should show create info when it is not a company team [JPT-237]', () => {
      const props = { ...baseProps, isCompanyTeam: false };
      const wrapper = mount(
        <ThemeProvider theme={theme}>
          <ConversationInitialPostView {...props} />
        </ThemeProvider>,
      );

      wrapper.mount();
      expect(wrapper.html().includes(creator.userDisplayName)).toBeTruthy();
      expect(wrapper.html().includes(displayName)).toBeTruthy();
      expect(wrapper.html().includes(createTime.toString())).toBeTruthy();
    });

    it('should not show create info when it is a company team [JPT-237]', () => {
      const props = { ...baseProps, isCompanyTeam: true };
      const wrapper = mount(
        <ThemeProvider theme={theme}>
          <ConversationInitialPostView {...props} />
        </ThemeProvider>,
      );

      wrapper.mount();
      expect(wrapper.html().includes(creator.userDisplayName)).toBeFalsy();
      expect(wrapper.html().includes(displayName)).toBeFalsy();
      expect(wrapper.html().includes(createTime.toString())).toBeFalsy();
    });
  });
});
