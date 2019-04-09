/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-08 20:58:28
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';
import { JuiTypography } from 'jui/foundation/Typography';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { TAB_TYPE } from '@/modules/GlobalSearch/container/InstantSearch/types';
import { InstantSearchView } from '@/modules/GlobalSearch/container/InstantSearch/InstantSearch.View';
import { JuiSearchTitle } from 'jui/pattern/GlobalSearch';
import { theme } from '../../../../../__tests__/utils';

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/group');
jest.mock('sdk/module/config');
jest.mock('sdk/module/search');
jest.mock('@/modules/telephony');

function setup(type?: TAB_TYPE | 'ALL') {
  return {
    onShowMore: jest.fn(),
    onKeyUp: () => {},
    getSearchScope: () => {},
    onKeyDown: () => {},
    onEnter: () => {},
    terms: [],
    setSelectIndex: () => {},
    resetSelectIndex: () => {},
    selectIndexChange: () => {},
    t: (key: string) => key,
    selectIndex: [-1, -1],
    searchResult: [
      {
        ids: type === TAB_TYPE.PEOPLE || type === 'ALL' ? [1, 2, 3, 4, 5] : [1, 2, 3],
        hasMore: type === TAB_TYPE.PEOPLE || type === 'ALL',
        type: RecentSearchTypes.PEOPLE,
      },
      {
        ids: type === TAB_TYPE.GROUPS || type === 'ALL' ? [1, 2, 3, 4, 5] : [1, 2, 3],
        hasMore: type === TAB_TYPE.GROUPS || type === 'ALL',
        type: RecentSearchTypes.GROUP,
      },
      {
        ids: type === TAB_TYPE.TEAM || type === 'ALL' ? [1, 2, 3, 4, 5] : [1, 2, 3],
        hasMore: type === TAB_TYPE.TEAM || type === 'ALL',
        type: RecentSearchTypes.TEAM,
      },
    ],
  };
}

describe('InstantSearchView', () => {
  describe('display show more button in each section when search result item > 3 [JPT-1568]', () => {
    it('result item > 3', () => {
      const props = setup('ALL');
      const wrapper = mountWithTheme(<InstantSearchView {...props} />);
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(0)
          .find(JuiTypography)
          .text(),
      ).toBe('globalSearch.People');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(0)
          .find('span')
          .text(),
      ).toBe('globalSearch.showMore');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(1)
          .find(JuiTypography)
          .text(),
      ).toBe('globalSearch.Groups');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(1)
          .find('span')
          .text(),
      ).toBe('globalSearch.showMore');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(2)
          .find(JuiTypography)
          .text(),
      ).toBe('globalSearch.Teams');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(2)
          .find('span')
          .text(),
      ).toBe('globalSearch.showMore');
    });
    it('result item <= 3', () => {
      const props = setup();
      const wrapper = mountWithTheme(<InstantSearchView {...props} />);
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(0)
          .find(JuiTypography)
          .text(),
      ).toBe('globalSearch.People');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(0)
          .find('span'),
      ).toHaveLength(0);
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(1)
          .find(JuiTypography)
          .text(),
      ).toBe('globalSearch.Groups');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(1)
          .find('span'),
      ).toHaveLength(0);
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(2)
          .find(JuiTypography)
          .text(),
      ).toBe('globalSearch.Teams');
      expect(
        wrapper
          .find(JuiSearchTitle)
          .at(2)
          .find('span'),
      ).toHaveLength(0);
    });
  });
  describe('Check click show more button can open search result dialog [JPT-1570]', () => {
    it('PEOPLE', () => {
      const props = setup(TAB_TYPE.PEOPLE);
      const wrapper = mountWithTheme(<InstantSearchView {...props} />);
      wrapper
        .find(JuiSearchTitle)
        .at(0)
        .find('span')
        .simulate('click');
      expect(props.onShowMore).toHaveBeenCalledWith(RecentSearchTypes.PEOPLE);
    });
    it('GROUP', () => {
      const props = setup(TAB_TYPE.GROUPS);
      const wrapper = mountWithTheme(<InstantSearchView {...props} />);
      wrapper
        .find(JuiSearchTitle)
        .at(1)
        .find('span')
        .simulate('click');
      expect(props.onShowMore).toHaveBeenCalledWith(RecentSearchTypes.GROUP);
    });
    it('TEAM', () => {
      const props = setup(TAB_TYPE.TEAM);
      const wrapper = mountWithTheme(<InstantSearchView {...props} />);
      wrapper
        .find(JuiSearchTitle)
        .at(2)
        .find('span')
        .simulate('click');
      expect(props.onShowMore).toHaveBeenCalledWith(RecentSearchTypes.TEAM);
    });
  });
});
