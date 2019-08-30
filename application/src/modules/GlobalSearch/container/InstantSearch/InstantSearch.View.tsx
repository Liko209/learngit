/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:58
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { HotKeys } from 'jui/hoc/HotKeys';
import { JuiInstantSearch, JuiSearchTitle } from 'jui/pattern/GlobalSearch';
import { InstantSearchViewProps, SearchItems, cacheEventFn } from './types';
import { SearchSectionsConfig } from '../config';

type Props = InstantSearchViewProps & WithTranslation;

@observer
class InstantSearchViewComponent extends Component<Props> {
  private [cacheEventFn._hoverHighlightMap]: Map<string, Function> = new Map();
  private [cacheEventFn._selectChangeMap]: Map<string, Function> = new Map();

  private _cacheIndexPathFn = (
    type: cacheEventFn,
    sectionIndex: number,
    cellIndex: number,
  ) => {
    const fnKey = `${sectionIndex}${cellIndex}`;
    const fnMap = this[type];
    if (!fnMap.get(fnKey)) {
      fnMap.set(fnKey, () => {
        this.props.setSelectIndex(sectionIndex, cellIndex);
      });
    }
    return fnMap.get(fnKey);
  };

  hoverHighlight = (sectionIndex: number, cellIndex: number) => {
    return this._cacheIndexPathFn(
      cacheEventFn._hoverHighlightMap,
      sectionIndex,
      cellIndex,
    );
  };

  // if search item removed need update selectIndex
  selectIndexChange = (sectionIndex: number, cellIndex: number) => {
    return this._cacheIndexPathFn(
      cacheEventFn._selectChangeMap,
      sectionIndex,
      cellIndex,
    );
  };

  createSearchItem = (config: {
    value: number | string;
    cellIndex: number;
    sectionIndex: number;
    type: string;
  }) => {
    const { terms, selectIndex, resetSelectIndex, getSearchScope } = this.props;
    const { value, type, sectionIndex, cellIndex } = config;

    const { Item, automationId } = SearchSectionsConfig[type];
    const hovered =
      sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];

    return (
      <Item
        searchScope={getSearchScope(cellIndex)}
        displayName={typeof value === 'string' ? value : null}
        hovered={hovered}
        onMouseEnter={this.hoverHighlight(sectionIndex, cellIndex)}
        onMouseLeave={resetSelectIndex}
        automationId={`search-${automationId}-item`}
        didChange={this.selectIndexChange(sectionIndex, cellIndex)}
        terms={terms}
        id={typeof value === 'string' ? null : value}
        key={typeof value === 'string' ? `${value}${cellIndex}` : value}
        analysisSource="instantSearchResult"
        dataTrackingDomain="globalSearch"
      />
    );
  };

  get searchResultList() {
    const { searchResult, onShowMore, t } = this.props;
    return searchResult.map(
      ({ ids, type, hasMore }: SearchItems, sectionIndex: number) => {
        if (ids.length === 0) return null;

        const { title, automationId } = SearchSectionsConfig[type as string];

        return (
          <React.Fragment key={type}>
            <JuiSearchTitle
              onButtonClick={onShowMore(type)}
              showButton={hasMore}
              buttonText={t('globalSearch.showMore')}
              title={t(title)}
              automationId={automationId}
            />
            {ids.map((id: number | string, cellIndex: number) => {
              return this.createSearchItem({
                type,
                sectionIndex,
                cellIndex,
                value: id,
              });
            })}
          </React.Fragment>
        );
      },
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
        <JuiInstantSearch data-test-automation-id="search-results">
          {this.searchResultList}
        </JuiInstantSearch>
      </HotKeys>
    );
  }
}

const InstantSearchView = withTranslation('translations')(
  InstantSearchViewComponent,
);

export { InstantSearchView };
