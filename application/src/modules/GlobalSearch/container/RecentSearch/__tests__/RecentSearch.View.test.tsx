/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-11 11:27:37
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { JuiRecentSearchEmptyScreen } from 'jui/pattern/GlobalSearch';
import { RecentSearchView } from '../RecentSearch.View';
import jsonFile from '../../../../../../public/locales/en/translations.json';

const i18n = (key: string, { count }: { count?: number } = {}) => {
  const paths = key.split('.');
  const result = paths.reduce((res, current) => res[current], jsonFile);
  if (typeof count === 'number') {
    return result.replace(/{{count}}/, count.toString());
  }
  return result;
};

describe('RecentSearch', () => {
  it('component should display empty page when there are no records found matching"[JPT-1598]', () => {
    const props = {
      onKeyUp: () => {},
      onKeyDown: () => {},
      onEnter: () => {},
      resetSelectIndex: () => {},
      setSelectIndex: () => {},
      clearRecent: () => {},
      selectIndexChange: () => {},
      recentRecord: [],
      terms: [],
      selectIndex: -1,
      t: i18n,
    };
    const wrapper = shallow(<RecentSearchView {...props} />);
    expect(wrapper.find(JuiRecentSearchEmptyScreen).props().text).toEqual(
      'Search for contacts and keywords',
    );
  });
});
