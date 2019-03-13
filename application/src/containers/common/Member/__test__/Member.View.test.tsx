import React from 'react';
import { mount } from 'enzyme';
import { JuiConversationPageMember } from 'jui/pattern/ConversationPageMember';
import View from '../Member.View';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../../__tests__/utils';

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

const vPropsFactory = (
  showMembersCount: boolean,
  membersCount: number,
  onClick = () => {},
) => ({
  showMembersCount,
  membersCount,
  onClick,
});

describe('Conversation MemberView check members count', () => {
  it('should reveal the correct member when received count [JPT-1366]', () => {
    const wrapper = mountWithTheme(<View {...vPropsFactory(true, 100)} />);

    expect(wrapper.html().includes('<span>100</span>')).toEqual(true);
  });
});

describe('Conversation MemberView open profile [1368]', () => {
  it('should be open when icon clicked', () => {
    const onClick = jest.fn();
    const wrapper = mountWithTheme(
      <View {...vPropsFactory(true, 100, onClick)} />,
    );

    wrapper.find(JuiConversationPageMember).simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});
