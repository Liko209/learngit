/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-08 12:16:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { JuiListSubheader } from 'jui/components/Lists';
import {
  ListSearchResultView,
  RecentSearchType,
} from '@/modules/GlobalSearch/container/ListSearchResult/ListSearchResult.View';
import { TAB_TYPE } from '@/modules/GlobalSearch/container/ListSearchResult/types';
import { ItemList } from '@/modules/GlobalSearch/container/ItemList';
import jsonFile from '../../../../../../public/locales/en/translations.json';

describe('ListSearchResult', () => {
  it("page should render null if currentTab doesn't equal to its type", () => {
    const props: any = {
      type: TAB_TYPE.TEAM,
      currentTab: TAB_TYPE.PEOPLE,
      search: () => [1, 2],
    };
    const wrapper = shallow(<ListSearchResultView {...props} />);
    expect(wrapper.type()).toEqual(null);
  });

  // TODO: wait for emtpy page component
  it.skip('component should display empty page when there are no records found matching and title should be "Results (0)"', () => {});

  it('component\'s title should be "Results" with the count of the matching records displayed', () => {
    const props = {
      type: TAB_TYPE.PEOPLE,
      currentTab: TAB_TYPE.PEOPLE,
      search: jest.fn(),
      t: (key: string, { count }: { count: number }) =>
        jsonFile.globalSearch.Results.replace(/{{count}}/, count.toString()),
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
