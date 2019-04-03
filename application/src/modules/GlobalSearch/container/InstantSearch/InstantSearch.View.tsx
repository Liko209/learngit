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

import { InstantSearchViewProps, SearchItems } from './types';
import { SearchSectionsConfig } from '../config';

type Props = InstantSearchViewProps & WithTranslation;

@observer
class InstantSearchViewComponent extends Component<Props> {
  hoverHighlight = (sectionIndex: number, cellIndex: number) => () => {
    this.props.setSelectIndex(sectionIndex, cellIndex);
  }

  // if search item removed need update selectIndex
  selectIndexChange = (sectionIndex: number, cellIndex: number) => () => {
    this.props.selectIndexChange(sectionIndex, cellIndex);
  }

  createSearchItem = (config: {
    id: number | string;
    cellIndex: number;
    sectionIndex: number;
    type: string;
  }) => {
    const { terms, selectIndex, resetSelectIndex } = this.props;
    const { id, type, sectionIndex, cellIndex } = config;

    const { SearchItem, title } = SearchSectionsConfig[type];
    const hovered =
      sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];
    return (
      <SearchItem
        hovered={hovered}
        onMouseEnter={this.hoverHighlight(sectionIndex, cellIndex)}
        onMouseLeave={resetSelectIndex}
        title={title}
        didChange={this.selectIndexChange(sectionIndex, cellIndex)}
        terms={terms}
        id={id}
        key={id}
      />
    );
  }

  get searchResultList() {
    const { searchResult, t } = this.props;
    return searchResult.map(
      ({ ids, type, hasMore }: SearchItems, sectionIndex: number) => {
        if (ids.length === 0) return null;

        const { title } = SearchSectionsConfig[type];
        return (
          <React.Fragment key={type}>
            <JuiSearchTitle
              showButton={hasMore}
              buttonText={t('globalSearch.showMore')}
              title={t(title)}
              data-test-automation-id={`search-${title}`}
            />
            {ids.map((id: number, cellIndex: number) => {
              return this.createSearchItem({
                id,
                type,
                sectionIndex,
                cellIndex,
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
