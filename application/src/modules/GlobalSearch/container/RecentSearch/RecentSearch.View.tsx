/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:16:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiRecentSearch,
  JuiSearchTitle,
  JuiRecentSearchEmptyScreen,
} from 'jui/pattern/GlobalSearch';
import { HotKeys } from 'jui/hoc/HotKeys';

import { RecentSearchViewProps, RecentRecord, cacheEventFn } from './types';
import { SearchSectionsConfig } from '../config';

type Props = RecentSearchViewProps &
  WithTranslation & {
    terms: string[];
  };

@observer
class RecentSearchViewComponent extends Component<Props> {
  private [cacheEventFn._hoverHighlightMap]: Map<string, Function> = new Map();
  private [cacheEventFn._selectChangeMap]: Map<string, Function> = new Map();

  private _cacheIndexPathFn = (type: cacheEventFn, index: number) => {
    const fnKey = `${index}`;
    const fnMap = this[type];
    if (!fnMap.get(fnKey)) {
      fnMap.set(fnKey, () => {
        this.props.setSelectIndex(index);
      });
    }
    return fnMap.get(fnKey);
  };

  hoverHighlight = (index: number) => {
    return this._cacheIndexPathFn(cacheEventFn._hoverHighlightMap, index);
  };

  // if search item removed need update selectIndex
  selectIndexChange = (index: number) => {
    return this._cacheIndexPathFn(cacheEventFn._selectChangeMap, index);
  };

  createSearchItem = (config: {
    value: number | string;
    index: number;
    type: string;
    recentId: number;
    queryParams?: {
      groupId: number;
    };
  }) => {
    const { selectIndex, resetSelectIndex } = this.props;
    const { value, type, index, queryParams, recentId } = config;

    const { Item, title } = SearchSectionsConfig[type];
    const hovered = index === selectIndex;

    return (
      <Item
        hovered={hovered}
        displayName={typeof value === 'string' ? value : null}
        onMouseEnter={this.hoverHighlight(index)}
        onMouseLeave={resetSelectIndex}
        title={title}
        didChange={this.selectIndexChange(index)}
        recentId={recentId}
        id={typeof value === 'string' ? null : value}
        key={typeof value === 'string' ? `${value}${index}` : value}
        params={queryParams}
        analysisSource="recentSearchedList"
        dataTrackingDomain="globalSearch"
      />
    );
  };

  get searchRecordList() {
    const { recentRecord, clearRecent, t } = this.props;

    if (recentRecord.length === 0) {
      return (
        <JuiRecentSearchEmptyScreen
          text={t('globalSearch.SearchForContactsAndKeywords')}
        />
      );
    }

    return (
      <>
        <JuiSearchTitle
          onButtonClick={clearRecent}
          showButton
          buttonText={t('globalSearch.ClearHistory')}
          title={t('globalSearch.RecentSearches')}
          automationId={'clear'}
        />
        {recentRecord.map((recentSearchModel: RecentRecord, index: number) => {
          const { value, type, queryParams, id } = recentSearchModel;
          return this.createSearchItem({
            index,
            type,
            value,
            queryParams,
            recentId: id,
          });
        })}
      </>
    );
  }

  render() {
    const { onKeyUp, onKeyDown, onEnter } = this.props;

    return (
      <HotKeys
        keyMap={{
          up: onKeyUp,
          down: onKeyDown,
          enter: onEnter,
        }}
        global
      >
        <JuiRecentSearch data-test-automation-id="search-records">
          {this.searchRecordList}
        </JuiRecentSearch>
      </HotKeys>
    );
  }
}

const RecentSearchView = withTranslation('translations')(
  RecentSearchViewComponent,
);

export { RecentSearchView };
