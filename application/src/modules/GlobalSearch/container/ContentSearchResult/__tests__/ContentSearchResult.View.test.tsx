/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-09 17:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { ContentSearchResultView } from '../ContentSearchResult.View';
import { Stream as PostListStream } from '@/containers/PostListPage/Stream';

jest.mock('@/containers/ConversationPost', () => () => 'conversation');

describe('ContentSearchResult.View', () => {
  it('should render Stream after mount', () => {
    const props = {
      searchState: {
        postIds: [],
        requestId: null,
        contentsCount: {},
      },
      searchOptions: {},
      onPostsFetch: jest.fn(),
      setSearchOptions: jest.fn(),
      onSearchEnd: jest.fn(),
    };
    const result = shallow(<ContentSearchResultView {...props} />);
    expect(result.state().renderList).toBe(true);
    expect(result.find(PostListStream).exists()).toBe(true);
  });

  it('should remount Stream when requestId reset', () => {
    jest.spyOn(ContentSearchResultView.prototype, 'remountStream');
    const props = {
      searchState: {
        postIds: [],
        requestId: 12,
        contentsCount: {},
      },
      searchOptions: {},
      onPostsFetch: jest.fn(),
      setSearchOptions: jest.fn(),
      onSearchEnd: jest.fn(),
    };
    const wrapper = shallow(<ContentSearchResultView {...props} />);
    wrapper.setProps({
      searchState: { requestId: null, contentsCount: {}, postIds: [] },
    });
    expect(ContentSearchResultView.prototype.remountStream).toHaveBeenCalled();
  });

  it('should end search when unmount', () => {
    const props = {
      searchState: {
        postIds: [],
        requestId: 12,
        contentsCount: {},
      },
      searchOptions: {},
      onPostsFetch: jest.fn(),
      setSearchOptions: jest.fn(),
      onSearchEnd: jest.fn(),
    };
    const wrapper = shallow(<ContentSearchResultView {...props} />);
    wrapper.unmount();
    expect(props.onSearchEnd).toHaveBeenCalled();
  });
});
