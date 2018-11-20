import React from 'react';
import { shallow } from 'enzyme';
import { ConversationPost } from '../../../ConversationPost';
import GroupStateModel from '@/store/models/GroupState';
import { LoadingMorePlugin } from '@/plugins';
import { StreamView } from '../Stream.View';
import { StreamItemType } from '../types';
import { TimeNodeDivider } from '../../TimeNodeDivider';

jest.mock('../../../ConversationSheet', () => ({}));
const context = {
  scrollToRow: () => {},
  onListAsyncshallowed: (el: React.RefObject<any>) => {},
};
function renderJumpToFirstUnreadButton({
  hasHistoryUnread,
  firstHistoryUnreadInPage,
  firstHistoryUnreadPostViewed,
}: {
  hasHistoryUnread: boolean;
  firstHistoryUnreadInPage: boolean;
  firstHistoryUnreadPostViewed: boolean;
}) {
  const props = {
    ...baseProps,
    hasHistoryUnread,
    firstHistoryUnreadInPage,
    loadInitialPosts: async () => {},
  };

  const wrapper = shallow(<StreamView {...props} />, {
    context,
  });
  (wrapper.instance() as any)._firstHistoryUnreadPostViewed = firstHistoryUnreadPostViewed;
  wrapper.update();
  const jumpToFirstUnreadButtonWrapper = wrapper.find(
    'JumpToFirstUnreadButtonWrapper',
  );
  const hasJumpToFirstUnreadButton =
    jumpToFirstUnreadButtonWrapper.length === 1;
  return { hasJumpToFirstUnreadButton };
}

const baseProps = {
  postIds: [],
  items: [],
  groupId: 1,
  setRowVisible: jest.fn().mockName('setRowVisible'),
  markAsRead: jest.fn().mockName('markAsRead'),
  atBottom: jest.fn().mockName('atBottom'),
  enableNewMessageSeparatorHandler: jest
    .fn()
    .mockName('enableNewMessageSeparatorHandler'),
  plugins: {
    loadingMorePlugin: new LoadingMorePlugin(),
  },
  hasMore: true,
  historyGroupState: {} as GroupStateModel,
  historyUnreadCount: 10,
  hasHistoryUnread: false,
  firstHistoryUnreadInPage: false,
  clearHistoryUnread: jest.fn().mockName('setHasUnread'),
  loadPostUntilFirstUnread: jest.fn().mockName('loadPostUntilFirstUnread'),
};

describe('StreamView', () => {
  describe('render()', () => {
    it('should render <ConversationPost>', () => {
      const props = {
        ...baseProps,
        postIds: [1, 2],
        items: [
          { type: StreamItemType.POST, value: 1 },
          { type: StreamItemType.POST, value: 2 },
        ],
        loadInitialPosts: async () => {},
      };

      const wrapper = shallow(<StreamView {...props} />, { context });
      const card = wrapper.find(ConversationPost);
      const card0 = card.at(0);
      const card1 = card.at(1);

      expect(card).toHaveLength(2);
      expect(card0.props()).toEqual({ id: 1 });
      expect(card1.props()).toEqual({ id: 2 });
      expect(card0.key()).toBe('ConversationPost1');
      expect(card1.key()).toBe('ConversationPost2');
    });

    it('should render <TimeNodeDivider>', () => {
      const props = {
        ...baseProps,
        postIds: [1, 2],
        items: [
          { type: StreamItemType.POST, value: 1 },
          { type: StreamItemType.NEW_MSG_SEPARATOR, value: null },
          { type: StreamItemType.POST, value: 2 },
        ],
        loadInitialPosts: async () => {},
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
          firstHistoryUnreadInPage: false,
          firstHistoryUnreadPostViewed: false,
        });

        expect(hasJumpToFirstUnreadButton).toBeFalsy();
      });
    });

    describe('hasHistoryUnread=true', () => {
      // JPT-206 / JPT-232
      it.skip('should not render jumpToFirstUnreadButton when first history unread in current page and was viewed', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          firstHistoryUnreadInPage: true,
          firstHistoryUnreadPostViewed: true,
        });
        expect(hasJumpToFirstUnreadButton).toBeFalsy();
      });

      // JPT-210
      it('should render jumpToFirstUnreadButton when first history unread in current page but was not viewed', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          firstHistoryUnreadInPage: true,
          firstHistoryUnreadPostViewed: false,
        });

        expect(hasJumpToFirstUnreadButton).toBeTruthy();
      });

      it('should render jumpToFirstUnreadButton when first history unread not in current page', () => {
        const { hasJumpToFirstUnreadButton } = renderJumpToFirstUnreadButton({
          hasHistoryUnread: true,
          firstHistoryUnreadInPage: false,
          firstHistoryUnreadPostViewed: false,
        });
        expect(hasJumpToFirstUnreadButton).toBeTruthy();
      });
    });
  });
});
