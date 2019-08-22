/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-03 10:14:06
 * Copyright © RingCentral. All rights reserved.
 */

import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiTabPageEmptyScreen,
  JuiListSearchResult,
} from 'jui/pattern/GlobalSearch';
import { JuiListSubheader } from 'jui/components/Lists';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  ListSearchResultProps,
  ListSearchResultViewProps,
  TAB_TYPE,
  SearchItemTypes,
} from './types';
import { ItemList } from '../ItemList';

export const RecentSearchType = {
  [TAB_TYPE.PEOPLE]: SearchItemTypes.PEOPLE,
  [TAB_TYPE.GROUPS]: SearchItemTypes.GROUP,
  [TAB_TYPE.TEAM]: SearchItemTypes.TEAM,
};

type Props = ListSearchResultViewProps &
  WithTranslation &
  ListSearchResultProps;

@observer
class ListSearchResultViewComponent extends Component<Props> {
  state = {
    searchResult: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { currentTab, search } = this.props;
    const searchResult = await search(currentTab);
    this.setState({ searchResult });
  };

  render() {
    const { t, currentTab, type, isShow, pageDataTracking } = this.props;
    const { searchResult } = this.state;

    if (type !== currentTab || !searchResult) {
      return null;
    }

    if (isShow) {
      pageDataTracking && pageDataTracking();
    }

    return (
      <JuiListSearchResult data-test-automation-id="global-full-search">
        <JuiListSubheader data-test-automation-id="searchResultsCount">
          {t('globalSearch.Results', {
            count: searchResult.length,
          })}
        </JuiListSubheader>
        {searchResult.length === 0 ? (
          <JuiTabPageEmptyScreen text={t('globalSearch.NoMatchesFound')} />
        ) : (
          <ItemList ids={searchResult} type={RecentSearchType[currentTab]} />
        )}
      </JuiListSearchResult>
    );
  }
}

const ListSearchResultView = withTranslation('translations')(
  ListSearchResultViewComponent,
);

export { ListSearchResultView };
