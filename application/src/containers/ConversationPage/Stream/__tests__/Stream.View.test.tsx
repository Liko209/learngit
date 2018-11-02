import React from 'react';
import { shallow } from 'enzyme';
import { ConversationCard } from '../../../ConversationCard';
import { StreamView } from '../Stream.View';
import { StreamItemType } from '../types';
import { TimeNodeDivider } from '../../TimeNodeDivider';

jest.mock('../../../ConversationSheet', () => ({}));

const baseProps = {
  groupId: 1,
  setRowVisible: jest.fn().mockName('setRowVisible'),
  markAsRead: jest.fn().mockName('markAsRead'),
  atBottom: jest.fn().mockName('atBottom'),
  enableNewMessageSeparatorHandler: jest
    .fn()
    .mockName('enableNewMessageSeparatorHandler'),
  hasMore: true,
  firstUnreadCount: 0,
  hasUnread: false,
  setHasUnread: jest.fn().mockName('setHasUnread'),
  loadPostUntilFirstUnread: jest.fn().mockName('loadPostUntilFirstUnread'),
};

describe('StreamView', () => {
  describe('render()', () => {
    it('should render <ConversationCard>', () => {
      const props = {
        ...baseProps,
        postIds: [1, 2],
        items: [
          { type: StreamItemType.POST, value: 1 },
          { type: StreamItemType.POST, value: 2 },
        ],
      };

      const wrapper = shallow(<StreamView {...props} />);
      const card = wrapper.find(ConversationCard);
      const card0 = card.at(0);
      const card1 = card.at(1);

      expect(card).toHaveLength(2);
      expect(card0.props()).toEqual({ id: 1 });
      expect(card1.props()).toEqual({ id: 2 });
      expect(card0.key()).toBe('1');
      expect(card1.key()).toBe('2');
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
      };

      const wrapper = shallow(<StreamView {...props} />);

      expect(wrapper.find(ConversationCard)).toHaveLength(2);
      expect(wrapper.find(TimeNodeDivider)).toHaveLength(1);
    });
  });
});
