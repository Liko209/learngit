/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-08 12:16:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { JuiListSubheader } from 'jui/components/Lists';
import { JuiTabPageEmptyScreen } from 'jui/pattern/GlobalSearch';
import {
  ListSearchResultView,
  RecentSearchType,
} from '@/modules/GlobalSearch/container/ListSearchResult/ListSearchResult.View';
import { TAB_TYPE } from '@/modules/GlobalSearch/container/ListSearchResult/types';
import { ItemList } from '@/modules/GlobalSearch/container/ItemList';
import jsonFile from '../../../../../../public/locales/en/translations.json';

const i18n = (key: string, { count }: { count?: number } = {}) => {
  const paths = key.split('.');
  const result = paths.reduce((res, current) => res[current], jsonFile);
  if (typeof count === 'number') {
    return result.replace(/{{count}}/, count.toString());
  }
  return result;
};

describe('ListSearchResult', () => {
  it("page should render null if currentTab doesn't equal to its type", () => {
    const props: any = {
      t: i18n,
      type: TAB_TYPE.TEAM,
      currentTab: TAB_TYPE.PEOPLE,
      search: () => [1, 2],
    };
    const wrapper = shallow(<ListSearchResultView {...props} />);
    expect(wrapper.type()).toEqual(null);
  });

  it('component should display empty page when there are no records found matching and title should be "Results (0)"[JPT-1596]', () => {
    const props = {
      type: TAB_TYPE.PEOPLE,
      currentTab: TAB_TYPE.PEOPLE,
      search: jest.fn(),
      t: i18n,
    };
    const wrapper = shallow(<ListSearchResultView {...props} />);
    wrapper.instance().setState({ searchResult: [] });
    wrapper.update();
    expect(wrapper.find(JuiListSubheader).text()).toEqual('Results (0)');
    expect(wrapper.find(JuiTabPageEmptyScreen).props().text).toEqual(
      'No matches found',
    );
  });

  it('component\'s title should be "Results" with the count of the matching records displayed', () => {
    const props = {
      type: TAB_TYPE.PEOPLE,
      currentTab: TAB_TYPE.PEOPLE,
      search: jest.fn(),
      t: i18n,
    };
    const wrapper = shallow(<ListSearchResultView {...props} />);
    wrapper.instance().setState({ searchResult: [1, 2] });
    wrapper.update();
    expect(wrapper.find(JuiListSubheader).text()).toEqual('Results (2)');
  });

  it('component should display ItemList when there has records found matching', () => {
    const props = {
      type: TAB_TYPE.PEOPLE,
      currentTab: TAB_TYPE.PEOPLE,
      search: jest.fn(),
      t: i18n,
    };
    const searchResult = [1, 2];
    const wrapper = shallow(<ListSearchResultView {...props} />);
    wrapper.instance().setState({ searchResult });
    wrapper.update();
    expect(wrapper.find(ItemList)).toBeDefined();
    expect(wrapper.find(ItemList).props()).toEqual({
      list: searchResult,
      type: RecentSearchType[props.currentTab],
    });
  });
});
