import React from 'react';
import { mount } from 'enzyme';
import { StyledConversationPageMember } from 'jui/pattern/ConversationPageMember';
import { MemberView } from '../Member.View';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../../__tests__/utils';
import { OpenProfile } from '../../../../common/OpenProfile';

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

const vPropsFactory = (showMembersCount: boolean, membersCount: number) => ({
  showMembersCount,
  membersCount,
  groupId: 1,
});

describe('MemberView', () => {
  it('should reveal the correct member when received count [JPT-1366]', () => {
    const wrapper = mountWithTheme(
      <MemberView {...vPropsFactory(true, 100)} />,
    );

    expect(wrapper.html().includes('<span>100</span>')).toEqual(true);
  });

  it('should profile be open when member icon clicked [JPT-1368]', () => {
    jest.spyOn(OpenProfile, 'show');

    const wrapper = mountWithTheme(
      <MemberView {...vPropsFactory(true, 100)} />,
    );

    wrapper
      .find(StyledConversationPageMember)
      .simulate('mouseenter')
      .find('button > button')
      .simulate('click');

    expect(OpenProfile.show).toHaveBeenCalled();
  });
});
