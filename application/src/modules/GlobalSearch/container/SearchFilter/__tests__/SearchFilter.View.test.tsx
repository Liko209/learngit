/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-08-02 16:23:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { SearchFilterView } from '../SearchFilter.View';
import { ContactSearch, GroupSearch } from '@/containers/Downshift';

const i18n = (key: string) => {
  return key;
};

describe('SearchFilter', () => {
  it('Check the ghost text for the posted by input field and posted in input field [JPT-1534, JPT-1540]', () => {
    const props = {
      handleSearchPersonChange: () => {},
      handleSearchGroupChange: () => {},
      handleSearchTypeChange: () => {},
      handleSearchPostDateChange: () => {},
      typeFilter: [],
      timePeriodFilter: [],
      timeType: '1',
      setSearchOptions: () => {},
      searchOptions: {},
      contentsCount: {},
      t: i18n,
    };
    const wrapper = shallow(<SearchFilterView {...props} />);
    expect(wrapper.find(ContactSearch).props().placeholder).toEqual(
      'globalSearch.postedByPlaceholder',
    );
    expect(wrapper.find(GroupSearch).props().placeholder).toEqual(
      'globalSearch.postedInPlaceholder',
    );
  });
});
