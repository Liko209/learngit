/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:16:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiRecentSearch, JuiSearchTitle } from 'jui/pattern/GlobalSearch';
import { HotKeys } from 'jui/hoc/HotKeys';

import { RecentSearchViewProps, RecentSearchModel } from './types';
import { SearchSectionsConfig } from '../config';
import { cacheEventFn } from '../constants';

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
  }

  hoverHighlight = (index: number) => {
    return this._cacheIndexPathFn(cacheEventFn._hoverHighlightMap, index);
  }

  // if search item removed need update selectIndex
  selectIndexChange = (index: number) => {
    return this._cacheIndexPathFn(cacheEventFn._selectChangeMap, index);
  }

  createSearchItem = (config: { id: number | string; index: number; type: string }) => {
    const { selectIndex, resetSelectIndex } = this.props;
    const { id, type, index } = config;

    const { Item, title } = SearchSectionsConfig[type];
    const hovered = index === selectIndex;

    return (
      <Item
        hovered={hovered}
        onMouseEnter={this.hoverHighlight(index)}
        onMouseLeave={resetSelectIndex}
        title={title}
        didChange={this.selectIndexChange(index)}
        id={id}
        key={id}
      />
    );
  }

  get searchRecordList() {
    const { recentRecord, clearRecent, t } = this.props;

    if (recentRecord.length === 0) {
      return null;
    }

    return (
      <>
        <JuiSearchTitle
          onButtonClick={clearRecent}
          showButton={true}
          buttonText={t('globalSearch.ClearHistory')}
          title={t('globalSearch.RecentSearches')}
          data-test-automation-id={'search-clear'}
        />
        {recentRecord.map((recentSearchModel: RecentSearchModel, index: number) => {
          const { value, type } = recentSearchModel;
          return this.createSearchItem({
            index,
            type,
            id: value,
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
      >
        <JuiRecentSearch data-test-automation-id="search-records">
          {this.searchRecordList}
        </JuiRecentSearch>
      </HotKeys>
    );
  }
}

const RecentSearchView = withTranslation('translations')(RecentSearchViewComponent);

export { RecentSearchView };
