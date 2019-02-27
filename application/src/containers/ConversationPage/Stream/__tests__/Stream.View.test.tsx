import React from 'react';
import { shallow } from 'enzyme';
import { ConversationPost } from '../../../ConversationPost';
import GroupStateModel from '@/store/models/GroupState';
import { LoadingMorePlugin } from '@/plugins';
import { StreamViewComponent as StreamView } from '../Stream.View';
import { StreamItemType } from '../types';
import { TimeNodeDivider } from '../../TimeNodeDivider';
import i18next from 'i18next';
import { ConversationInitialPost } from '@/containers/ConversationInitialPost';

jest.mock('../../../ConversationSheet', () => ({}));

const baseProps = {
  i18n: {} as i18next.i18n,
  tReady: true,
  postIds: [],
  t: (): any => 'a',
  items: [],
  groupId: 1,
  setRowVisible: jest.fn().mockName('setRowVisible'),
  markAsRead: jest.fn().mockName('markAsRead'),
  atBottom: jest.fn().mockName('atBottom'),
  atTop: jest.fn().mockName('atTop'),
  enableNewMessageSeparatorHandler: jest
    .fn()
    .mockName('enableNewMessageSeparatorHandler'),
  plugins: {
    loadingMorePlugin: new LoadingMorePlugin(),
  },
  hasMoreUp: true,
  hasMoreDown: true,
  notEmpty: true,
  historyGroupState: {} as GroupStateModel,
  historyUnreadCount: 10,
  historyReadThrough: 0,
  hasHistoryUnread: false,
  firstHistoryUnreadInPage: false,
  clearHistoryUnread: jest.fn().mockName('setHasUnread'),
  loadPostUntilFirstUnread: jest.fn().mockName('loadPostUntilFirstUnread'),
  jumpToPostId: 0,
  loadInitialPosts: async () => {},
  updateHistoryHandler: () => {},
  mostRecentPostId: 0,
  resetJumpToPostId: () => null,
  resetAll: (id: number) => {},
};

function renderJumpToFirstUnreadButton({
  hasHistoryUnread,
  historyUnreadCount,
  firstHistoryUnreadInPage,
  firstHistoryUnreadPostViewed,
}: {
  hasHistoryUnread: boolean;
  historyUnreadCount: number;
  firstHistoryUnreadInPage: boolean;
  firstHistoryUnreadPostViewed: boolean;
}) {
  const props = {
    ...baseProps,
    hasHistoryUnread,
    historyUnreadCount,
    firstHistoryUnreadInPage,
  };

  const wrapper = shallow(<StreamView {...props} />);
  (wrapper.instance() as any)._firstHistoryUnreadPostViewed = firstHistoryUnreadPostViewed;
  wrapper.update();
  const jumpToFirstUnreadButtonWrapper = wrapper.find(
    'JumpToFirstUnreadButtonWrapper',
  );
  const hasJumpToFirstUnreadButton =
    jumpToFirstUnreadButtonWrapper.length === 1;
  return { hasJumpToFirstUnreadButton };
}

describe('StreamView', () => {
  describe('render()', () => {
    it('should render <ConversationPost>', () => {
      const props = {
        ...baseProps,
        postIds: [1, 2],
        items: [
          { type: StreamItemType.POST, id: 1, timeStart: 1, value: [1] },
          { type: StreamItemType.POST, id: 2, timeStart: 1, value: [2] },
        ],
      };

      const wrapper = shallow(<StreamView {...props} />);
      const card = wrapper.find(ConversationPost);
      const card0 = card.at(0);
      const card1 = card.at(1);
      expect(card).toHaveLength(2);
      expect(card0.props()).toMatchObject({ id: 1, highlight: false });
      expect(card1.props()).toMatchObject({ id: 2, highlight: false });
      expect(card0.key()).toBe('ConversationPost1');
      expect(card1.key()).toBe('ConversationPost2');
    });

    it('should render <TimeNodeDivider>', () => {
      const props = {
        ...baseProps,
        postIds: [1, 2],
        items: [
          { type: StreamItemType.POST, id: 1, timeStart: 1, value: [1] },
          {
            type: StreamItemType.NEW_MSG_SEPARATOR,
            id: 333,
            timeStart: 1,
            value: [333],
          },
          { type: StreamItemType.POST, id: 2, timeStart: 1, value: [2] },
        ],
      };
      const wrapper = shallow(<StreamView {...props} />);
      expect(wrapper.find(ConversationPost)).toHaveLength(2);
      expect(wrapper.find(TimeNodeDivider)).toHaveLength(1);
    });

    describe('hasHistoryUnread=false', () => {
      // JPT-205
      it('should not render jumpToFirstUnreadButton', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: false,
          historyUnreadCount: 0,
          firstHistoryUnreadInPage: false,
          firstHistoryUnreadPostViewed: false,
        });

        expect(hasJumpToFirstUnreadButton).toBeFalsy();
      });
    });

    describe('hasHistoryUnread=true', () => {
      // JPT-206 / JPT-232
      it('should not render jumpToFirstUnreadButton when first history unread in current page and was viewed', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 3,
          firstHistoryUnreadInPage: true,
          firstHistoryUnreadPostViewed: true,
        });
        expect(hasJumpToFirstUnreadButton).toBeFalsy();
      });

      // JPT-210
      it('should render jumpToFirstUnreadButton when first history unread in current page but was not viewed', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 3,
          firstHistoryUnreadInPage: true,
          firstHistoryUnreadPostViewed: false,
        });

        expect(hasJumpToFirstUnreadButton).toBeTruthy();
      });

      it('should not render jumpToFirstUnreadButton when unread count not greater than 1', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 1,
          firstHistoryUnreadInPage: false,
          firstHistoryUnreadPostViewed: false,
        });
        expect(hasJumpToFirstUnreadButton).toBeFalsy();
      });

      it('should render jumpToFirstUnreadButton when first history unread not in current page', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 3,
          firstHistoryUnreadInPage: false,
          firstHistoryUnreadPostViewed: false,
        });
        expect(hasJumpToFirstUnreadButton).toBeTruthy();
      });
    });

    describe('conversationInitialPost', () => {
      function getWrapper(otherProps: object) {
        return shallow(<StreamView {...baseProps} {...otherProps} />);
      }

      it('should render conversationInitialPost when hasMoreUp is false [JPT-478]', () => {
        const hasMoreUp = false;
        const hasSomeMessages = getWrapper({ hasMoreUp, notEmpty: false });
        const noMessages = getWrapper({ hasMoreUp, notEmpty: true });

        expect(hasSomeMessages.find(ConversationInitialPost)).toHaveLength(1);
        expect(noMessages.find(ConversationInitialPost)).toHaveLength(1);
      });

      it('should not render conversationInitialPost when hasMoreUp is true  [JPT-478]', () => {
        const hasMoreUp = true;
        const hasSomeMessages = getWrapper({ hasMoreUp, notEmpty: false });
        const noMessages = getWrapper({ hasMoreUp, notEmpty: true });

        expect(hasSomeMessages.find(ConversationInitialPost)).toHaveLength(0);
        expect(noMessages.find(ConversationInitialPost)).toHaveLength(0);
      });

      it('should deactivate visibility checking when _visibilitySensorEnabled is false by default', () => {
        const hasMoreUp = false;
        const hasSomeMessages = getWrapper({ hasMoreUp, notEmpty: false });
        const noMessages = getWrapper({ hasMoreUp, notEmpty: true });
        hasSomeMessages.update();
        noMessages.update();
        expect(
          hasSomeMessages
            .find(ConversationInitialPost)
            .parent()
            .prop('active'),
        ).toBe(false);
        expect(
          noMessages
            .find(ConversationInitialPost)
            .parent()
            .prop('active'),
        ).toBe(false);
      });
    });
  });
});
