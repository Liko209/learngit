import React from 'react';
import { shallow } from 'enzyme';
import { ConversationCard } from '@/containers/ConversationCard';
import { StreamView } from '../Stream.View';
import { NewMessageSeparator } from '../NewMessageSeparator';
import { StreamItemType } from '../types';

describe('StreamView', () => {
  describe('render()', () => {
    it('should render <ConversationCard>', () => {
      const props = {
        setRowVisible: jest.fn().mockName('setRowVisible'),
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

    it('should render <NewMessageSeparator>', () => {
      const props = {
        setRowVisible: jest.fn().mockName('setRowVisible'),
        postIds: [1, 2],
        items: [
          { type: StreamItemType.POST, value: 1 },
          { type: StreamItemType.NEW_MSG_SEPARATOR, value: null },
          { type: StreamItemType.POST, value: 2 },
        ],
      };

      const wrapper = shallow(<StreamView {...props} />);

      expect(wrapper.find(ConversationCard)).toHaveLength(2);
      expect(wrapper.find(NewMessageSeparator)).toHaveLength(1);
    });

    it('should render posts and separators', () => {
      const props = {
        setRowVisible: jest.fn().mockName('setRowVisible'),
        postIds: [1, 2, 3, 4],
        items: [
          { type: StreamItemType.POST, value: 1 },
          { type: StreamItemType.NEW_MSG_SEPARATOR, value: null },
          { type: StreamItemType.POST, value: 2 },
          { type: StreamItemType.POST, value: 3 },
          { type: StreamItemType.POST, value: 4 },
        ],
      };

      const wrapper = shallow(<StreamView {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    // TODO test empty view in the future.
    it('should render container', () => {
      const props = {
        setRowVisible: jest.fn().mockName('setRowVisible'),
        postIds: [],
        items: [],
      };

      const wrapper = shallow(<StreamView {...props} />);

      expect(wrapper).toMatchSnapshot();
    });
  });
});
