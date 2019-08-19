/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-19 10:51:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { TAB_TYPE } from '../../ItemList/types';
import { shallow } from 'enzyme';
import { FullSearchView } from '../FullSearch.View';
import history from '@/history';

jest.unmock('react-quill');
jest.unmock('quill');
jest.mock('@/modules/message/container/ConversationSheet', () => ({}));

describe('FullSearch.View', () => {
  it('should call jumpToConversationCallback when jump to conversation', () => {
    const props = {
      currentTab: TAB_TYPE.CONTENT,
      setCurrentTab: jest.fn(),
      jumpToConversationCallback: jest.fn(),
      resetSearchScope: jest.fn(),
    };
    shallow(<FullSearchView {...props} />);
    history.push('/messages/123');
    expect(props.jumpToConversationCallback).toHaveBeenCalled();

    props.jumpToConversationCallback.mockClear();
    history.push('/messages');
    expect(props.jumpToConversationCallback).not.toHaveBeenCalled();

    props.jumpToConversationCallback.mockClear();
    history.push('/phone');
    expect(props.jumpToConversationCallback).not.toHaveBeenCalled();
  });
});

describe('FullSearch.view fix(FIJI-5518)', () => {
  it('should search scope be reset when view unmount', () => {
    const props = {
      currentTab: TAB_TYPE.CONTENT,
      setCurrentTab: jest.fn(),
      jumpToConversationCallback: jest.fn(),
      resetSearchScope: jest.fn(),
    };

    const view = shallow(<FullSearchView {...props} />);

    view.unmount();

    expect(props.resetSearchScope).toHaveBeenCalled();
  });
});
