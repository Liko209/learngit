/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-03 10:14:06
 * Copyright © RingCentral. All rights reserved.
 */

import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiFullSearch } from 'jui/pattern/GlobalSearch';
import { JuiListSubheader } from 'jui/components/Lists';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  ListSearchResultProps,
  ListSearchResultViewProps,
  TAB_TYPE,
  RecentSearchTypes,
} from './types';
import { ItemList } from '../ItemList';

export const RecentSearchType = {
  [TAB_TYPE.PEOPLE]: RecentSearchTypes.PEOPLE,
  [TAB_TYPE.GROUPS]: RecentSearchTypes.GROUP,
  [TAB_TYPE.TEAM]: RecentSearchTypes.TEAM,
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
    this.fetchDatas();
  }

  fetchDatas = async () => {
    const { currentTab, search } = this.props;
    const searchResult = await search(currentTab);
    this.setState({ searchResult });
  }

  render() {
    const { t, currentTab, type } = this.props;
    const { searchResult } = this.state;

    if (type !== currentTab || !searchResult) {
      return null;
    }

    return (
      <JuiFullSearch>
        <JuiListSubheader data-test-automation-id="searchResultsCount">
          {t('globalSearch.Results', {
            count: searchResult.length,
          })}
        </JuiListSubheader>
        {searchResult.length === 0 ? (
          <div>empty</div>
        ) : (
          <ItemList list={searchResult} type={RecentSearchType[currentTab]} />
        )}
      </JuiFullSearch>
    );
  }
}

const ListSearchResultView = withTranslation('translations')(
  ListSearchResultViewComponent,
);

export { ListSearchResultView };
