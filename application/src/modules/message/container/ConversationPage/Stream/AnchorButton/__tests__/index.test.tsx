import { AnchorButton } from '..';
import { DIRECTION } from 'jui/components/Lists';
import React from 'react';
import ReactDOM from 'react-dom';
import { JuiLozengeButton } from 'jui/components/Buttons';
import * as buttonWrapper from '../../AnchorButtonWrapper';
import { mountWithTheme } from 'shield/utils';

describe('AnchorButton', () => {
  const basicProps = {
    firstHistoryUnreadInPage: false,
    hasHistoryUnread: true,
    historyUnreadCount: 10,
    historyViewed: false,
    jumpToFirstUnreadLoading: false,
    jumpToFirstUnread: jest.fn(),
    jumpToLatest: jest.fn(),
    isAboveScrollToLatestCheckPoint: true,
    hasMore: jest.fn().mockReturnValue(false),
  };
  beforeAll(() => {
    document.getElementById = i => new Image();
    jest
      .spyOn(buttonWrapper, 'AnchorButtonWrapper')
      .mockImplementation(({ children }) => <div>{...children}</div>);
  });
  describe('render', () => {
    it('Unread button priority over recent button when there is unread message [JPT-2565]', () => {
      const wrapper = mountWithTheme(<AnchorButton {...basicProps} />);
      console.log(wrapper.html());
      const button: JuiLozengeButton = wrapper.find(JuiLozengeButton);
      expect(button.prop('arrowDirection')).toEqual(DIRECTION.UP);
    });
    it('Unread button priority over recent button when hasMoreDown is true [JPT-2617]', () => {
      const overridedProps = {
        hasMore: jest.fn().mockReturnValue(true),
      };
      const wrapper = mountWithTheme(
        <AnchorButton {...basicProps} {...overridedProps} />,
      );
      const button: JuiLozengeButton = wrapper.find(JuiLozengeButton);
      expect(button.prop('arrowDirection')).toEqual(DIRECTION.UP);
    });

    it('Unread button priority over recent button when hasMoreDown is false and no new message button [JPT-2617]', () => {
      const overridedProps = {
        hasMore: jest.fn().mockReturnValue(false),
        firstHistoryUnreadInPage: true,
        hasHistoryUnread: false,
      };
      const wrapper = mountWithTheme(
        <AnchorButton {...basicProps} {...overridedProps} />,
      );
      const button: JuiLozengeButton = wrapper.find(JuiLozengeButton);
      expect(button.prop('arrowDirection')).toEqual(DIRECTION.DOWN);
    });
  });
});
