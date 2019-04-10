/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-08 12:16:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { JuiListSubheader } from 'jui/components/Lists';
import { JuiTabPageEmptyScreen } from 'jui/pattern/GlobalSearch';
import { ContentSearchResultView } from '@/modules/GlobalSearch/container/ContentSearchResult/ContentSearchResult.View';
import { Stream as PostListStream } from '@/containers/PostListPage/Stream';
import jsonFile from '../../../../../../public/locales/en/translations.json';

const i18n = (key: string, { count }: { count?: number } = {}) => {
  const paths = key.split('.');
  const result = paths.reduce((res, current) => res[current], jsonFile);
  if (typeof count === 'number') {
    return result.replace(/{{count}}/, count.toString());
  }
  return result;
};

jest.mock('sdk/module/post');
jest.mock('@/containers/ConversationSheet', () => ({}));
jest.mock('@/containers/ConversationPost', () => () => 'conversation');

describe('ContentSearchResult', () => {
  it('component should display empty page when there are no records found matching and title should be "Results (0)"[JPT-1596]', () => {
    const props = {
      isEmpty: true,
      searchState: {
        requestId: 1234,
        postIds: [1],
        contentsCount: {
          1: 0,
        },
      },
      searchOptions: {},
      setSearchOptions: jest.fn(),
      onPostsFetch: jest.fn(),
      onSearchEnd: jest.fn(),
      t: i18n,
    };
    const wrapper = shallow(<ContentSearchResultView {...props} />);
    expect(wrapper.find(JuiListSubheader).text()).toEqual('Results (0)');
    expect(wrapper.find(JuiTabPageEmptyScreen).props().text).toEqual(
      'No matches found',
    );
  });
});

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
