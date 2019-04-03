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

type Props = RecentSearchViewProps &
  WithTranslation & {
    terms: string[];
  };

@observer
class RecentSearchViewComponent extends Component<Props> {
  hoverHighlight = (index: number) => () => {
    this.props.setSelectIndex(index);
  }

  // if search item removed need update selectIndex
  selectIndexChange = (index: number) => () => {
    this.props.selectIndexChange(index);
  }

  createSearchItem = (config: {
    id: number | string;
    index: number;
    type: string;
  }) => {
    const { selectIndex, resetSelectIndex } = this.props;
    const { id, type, index } = config;

    const { SearchItem, title } = SearchSectionsConfig[type];
    const hovered = index === selectIndex;

    return (
      <SearchItem
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

  clearRecent = () => {
    const { clearRecent } = this.props;
    clearRecent();
  }

  get searchRecordList() {
    const { recentRecord, t } = this.props;

    if (recentRecord.length === 0) {
      return null;
    }

    return (
      <>
        <JuiSearchTitle
          onButtonClick={this.clearRecent}
          showButton={true}
          buttonText={t('globalSearch.ClearHistory')}
          title={t('globalSearch.RecentSearches')}
          data-test-automation-id={'search-clear'}
        />
        {recentRecord.map(
          (recentSearchModel: RecentSearchModel, index: number) => {
            const { value, type } = recentSearchModel;
            return this.createSearchItem({
              index,
              type,
              id: value,
            });
          },
        )}
      </>
    );
  }

  onEnter = (e: KeyboardEvent) => {
    this.props.onEnter(e);
  }

  render() {
    const { onKeyUp, onKeyDown } = this.props;

    return (
      <HotKeys
        keyMap={{
          up: onKeyUp,
          down: onKeyDown,
          enter: this.onEnter,
        }}
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
