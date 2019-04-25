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
import jsonFile from '../../../../../../public/locales/en/translations.json';
import { JuiListSubheader } from 'jui/components/Lists';

const i18n = (key: string, { count }: { count?: number } = {}) => {
  const paths = key.split('.');
  const result = paths.reduce((res, current) => res[current], jsonFile);
  if (typeof count === 'number') {
    return result.replace(/{{count}}/, count.toString());
  }
  return result;
};

jest.mock('sdk/module/post');
jest.mock('@/modules/message/container/ConversationSheet', () => ({}));
jest.mock('@/modules/message/container/ConversationPost', () => () =>
  'conversation',
);

describe('ContentSearchResult', () => {
  it('component should display empty page when there are no records found matching and title should be "Results (0)"[JPT-1596]', () => {
    const props = {
      postsCount: 0,
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

describe('ContentSearchResult.View [bug/FIJI-5103]', () => {
  it('should not show Result(xx) when loading', () => {
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
    const wrapper = shallow(<ContentSearchResultView {...props} />);
    expect(wrapper.find(JuiListSubheader).exists()).toBe(false);

    wrapper.setProps({
      searchState: {
        postIds: [],
        requestId: 12,
        contentsCount: {},
      },
    });
    expect(wrapper.find(JuiListSubheader).exists()).toBe(true);
  });
});
