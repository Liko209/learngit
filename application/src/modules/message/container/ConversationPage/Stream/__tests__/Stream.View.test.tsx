import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import i18next from 'i18next';
import { ThemeProvider } from 'styled-components';
import GroupStateModel from '@/store/models/GroupState';
import { JuiInfiniteList } from 'jui/components/VirtualizedList';
import { JuiStreamLoading } from 'jui/pattern/ConversationLoading';
import { ConversationInitialPost } from '../../../ConversationInitialPost';
import { theme } from 'shield/utils';
import { ConversationPost } from '../../../ConversationPost';
import { TimeNodeDivider } from '../../TimeNodeDivider';
import { StreamViewComponent as StreamView } from '../Stream.View';
import { StreamItemType, StreamViewProps, STATUS } from '../types';
import { PostService } from 'sdk/module/post';

PostService.getInstance = jest.fn();

jest.unmock('react-quill');
jest.unmock('quill');
jest.mock('jui/components/AutoSizer/AutoSizer');
jest.mock('jui/components/VirtualizedList/InfiniteList');
jest.mock('sdk/module/post');
jest.mock('../../../ConversationSheet', () => ({}));
const hasMore = jest.fn().mockName('loadMore');

const baseProps = {
  hasMore,
  i18n: {} as i18next.i18n,
  tReady: true,
  postIds: [],
  t: (): any => 'a',
  items: [],
  groupId: 1,
  viewRef: React.createRef(),
  setRowVisible: jest.fn().mockName('setRowVisible'),
  markAsRead: jest.fn().mockName('markAsRead'),
  updateIgnoredStatus: jest.fn().mockName('updateIgnoredStatus'),
  atBottom: jest.fn().mockName('atBottom'),
  atTop: jest.fn().mockName('atTop'),
  enableNewMessageSeparatorHandler: jest
    .fn()
    .mockName('enableNewMessageSeparatorHandler'),
  loadMore: jest.fn().mockName('loadMore'),
  notEmpty: true,
  historyGroupState: {} as GroupStateModel,
  historyUnreadCount: 10,
  historyReadThrough: 0,
  hasHistoryUnread: false,
  firstHistoryUnreadInPage: false,
  clearHistoryUnread: jest.fn().mockName('setHasUnread'),
  getFirstUnreadPostByLoadAllUnread: jest
    .fn()
    .mockName('getFirstUnreadPostByLoadAllUnread'),
  jumpToPostId: 0,
  loadInitialPosts: async () => {},
  updateHistoryHandler: () => {},
  mostRecentPostId: 0,
  resetJumpToPostId: () => {},
  resetAll: (id: number) => {},
  refresh: () => {},
  updateConversationStatus: () => {},
};

function mountStreamWithUnreadButton({
  hasHistoryUnread,
  historyUnreadCount,
  firstHistoryUnreadInPage,
  historyViewed,
}: {
  hasHistoryUnread: boolean;
  historyUnreadCount: number;
  firstHistoryUnreadInPage: boolean;
  historyViewed: boolean;
}) {
  const props = {
    ...baseProps,
    hasHistoryUnread,
    historyUnreadCount,
    firstHistoryUnreadInPage,
  };

  const { wrapper, rootWrapper } = mountStream(props);
  (wrapper.instance() as any)._historyViewed = historyViewed;
  wrapper.instance().forceUpdate();
  rootWrapper.update();
  const jumpToFirstUnreadButtonWrapper = rootWrapper.find(
    'AnchorButtonWrapper',
  );
  const hasJumpToFirstUnreadButton =
    jumpToFirstUnreadButtonWrapper.length === 1;
  return { hasJumpToFirstUnreadButton, wrapper, rootWrapper };
}

function mountStream(otherProps: Partial<StreamViewProps>) {
  const wrapper = mount(
    <ThemeProvider theme={theme}>
      <StreamView {...baseProps} {...otherProps} />
    </ThemeProvider>,
  );
  return {
    rootWrapper: wrapper,
    wrapper: wrapper.find(StreamView),
  };
}

describe('StreamView', () => {
  describe('render()', () => {
    // TODO This case should be moved to electron environment
    it.skip('should render <ConversationPost>', () => {
      PostService.getInstance.mockReturnValue(new PostService());
      const props = {
        ...baseProps,
        postIds: [0, 1],
        items: [
          { type: StreamItemType.POST, id: 1, timeStart: 1, value: [1] },
          { type: StreamItemType.POST, id: 2, timeStart: 1, value: [2] },
        ],
      };

      const { wrapper, rootWrapper } = mountStream(props);

      console.log('rootWrapper: ', rootWrapper.html());
      const card = wrapper.find(ConversationPost);
      const card0 = card.at(0);
      const card1 = card.at(1);

      expect(card).toHaveLength(2);
      expect(card0.props()).toMatchObject({ id: 1, highlight: false });
      expect(card1.props()).toMatchObject({ id: 2, highlight: false });
      expect(card0.key()).toBe('ConversationPost1');
      expect(card1.key()).toBe('ConversationPost2');
      rootWrapper.unmount();
    });

    // TODO This case should be moved to electron environment
    it.skip('should render <TimeNodeDivider>', () => {
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
      const { wrapper, rootWrapper } = mountStream(props);
      expect(wrapper.find(ConversationPost)).toHaveLength(2);
      expect(wrapper.find(TimeNodeDivider)).toHaveLength(1);
      rootWrapper.unmount();
    });

    describe('hasHistoryUnread=false', () => {
      it('should not render jumpToFirstUnreadButton [JPT-205]', () => {
        const {
          hasJumpToFirstUnreadButton,
          rootWrapper,
        } = mountStreamWithUnreadButton({
          hasHistoryUnread: false,
          historyUnreadCount: 0,
          firstHistoryUnreadInPage: false,
          historyViewed: false,
        });

        expect(hasJumpToFirstUnreadButton).toBeFalsy();
        rootWrapper.unmount();
      });
    });

    // TODO refactoring: Move those cases to ViewModel
    describe('hasHistoryUnread=true', () => {
      it('should not render jumpToFirstUnreadButton when first history unread in current page and was viewed [JPT-206][JPT-232]', () => {
        const {
          hasJumpToFirstUnreadButton,
          rootWrapper,
        } = mountStreamWithUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 3,
          firstHistoryUnreadInPage: true,
          historyViewed: true,
        });
        expect(hasJumpToFirstUnreadButton).toBeFalsy();

        rootWrapper.unmount();
      });

      it('should render jumpToFirstUnreadButton when first history unread in current page but was not viewed [JPT-210]', () => {
        const {
          hasJumpToFirstUnreadButton,
          rootWrapper,
        } = mountStreamWithUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 3,
          firstHistoryUnreadInPage: true,
          historyViewed: false,
        });

        expect(hasJumpToFirstUnreadButton).toBeTruthy();

        rootWrapper.unmount();
      });

      it('should not render jumpToFirstUnreadButton when unread count not greater than 1', () => {
        const {
          hasJumpToFirstUnreadButton,
          rootWrapper,
        } = mountStreamWithUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 1,
          firstHistoryUnreadInPage: false,
          historyViewed: false,
        });
        expect(hasJumpToFirstUnreadButton).toBeFalsy();

        rootWrapper.unmount();
      });

      it('should render jumpToFirstUnreadButton when first history unread not in current page', () => {
        const {
          hasJumpToFirstUnreadButton,
          rootWrapper,
        } = mountStreamWithUnreadButton({
          hasHistoryUnread: true,
          historyUnreadCount: 3,
          firstHistoryUnreadInPage: false,
          historyViewed: false,
        });
        expect(hasJumpToFirstUnreadButton).toBeTruthy();
        rootWrapper.unmount();
      });
    });

    describe('display JuiInfiniteList or JuiStreamLoading', () => {
      it('success', () => {
        const { wrapper } = mountStream(baseProps);
        expect(wrapper.find(JuiInfiniteList)).toHaveLength(1);
      });

      it('pending', () => {
        const props = {
          ...baseProps,
          loadingStatus: STATUS.PENDING,
        };
        const { wrapper } = mountStream(props);
        expect(wrapper.find(JuiInfiniteList)).toHaveLength(1);
      });

      it('failed', () => {
        const props = {
          ...baseProps,
          loadingStatus: STATUS.FAILED,
        };
        const { wrapper } = mountStream(props);
        expect(wrapper.find(JuiStreamLoading)).toHaveLength(1);
      });
    });

    // TODO StreamController handle initial post now, those
    // cases should be moved to StreamController
    describe.skip('conversationInitialPost', () => {
      let hasSomeMessages: ReactWrapper;
      let hasSomeMessagesWrapper: ReactWrapper;
      let noMessages: ReactWrapper;
      let noMessagesWrapper: ReactWrapper;

      beforeEach(() => {
        hasMore.mockReturnValue(true);
        ({
          wrapper: hasSomeMessages,
          rootWrapper: hasSomeMessagesWrapper,
        } = mountStream({ notEmpty: false }));
        ({ wrapper: noMessages, rootWrapper: noMessagesWrapper } = mountStream({
          notEmpty: true,
        }));
      });

      afterEach(() => {
        hasSomeMessagesWrapper.unmount();
        noMessagesWrapper.unmount();
      });

      it('should render conversationInitialPost when hasMoreUp is false [JPT-478]', () => {
        expect(hasSomeMessages.find(ConversationInitialPost)).toHaveLength(1);
        expect(noMessages.find(ConversationInitialPost)).toHaveLength(1);
      });

      it('should not render conversationInitialPost when hasMoreUp is true  [JPT-478]', () => {
        expect(hasSomeMessages.find(ConversationInitialPost)).toHaveLength(0);
        expect(noMessages.find(ConversationInitialPost)).toHaveLength(0);
      });
    });
  });
});
