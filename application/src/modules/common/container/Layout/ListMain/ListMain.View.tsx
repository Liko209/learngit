/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-23 19:48:28
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer, Observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import { JuiPhoneFilter } from 'jui/pattern/Phone/Filter';
import { JuiAutoSizer } from 'jui/components/AutoSizer/AutoSizer';
import {
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { JuiEmptyPage } from 'jui/pattern/EmptyPage';
import { LayoutMain } from 'jui/pattern/Layout';
import { ErrorPage } from '@/modules/common/container/ErrorPage';
import { DataList } from '@/modules/common/container/DataList';
import { ThresholdStrategy } from 'jui/components/VirtualizedList';
import { debounce } from 'lodash';
import { dataAnalysis } from 'foundation/analysis';

import { ListMainViewProps } from './types';
import {
  LIST_HEADER_HEIGHT,
  DELAY_DEBOUNCE,
  LOADING_DELAY,
  INITIAL_COUNT,
  LIST_PRELOAD_DIRECTION,
  PRELOAD_COUNT,
} from './config';

@observer
class ListMainViewComponent extends Component<ListMainViewProps> {
  componentDidMount() {
    const { onShowDataTrackingKey } = this.props;
    if (onShowDataTrackingKey) {
      dataAnalysis.page(onShowDataTrackingKey);
    }
  }

  private _loadMoreStrategy = new ThresholdStrategy(
    {
      threshold: 60,
      minBatchCount: 10,
    },
    { direction: LIST_PRELOAD_DIRECTION, count: PRELOAD_COUNT },
  );

  private get _getDefaultListProps() {
    return {
      minRowHeight: this.props.minRowHeight,
      noRowsRenderer: this._noRowsRenderer,
      loadingRenderer: () => (
        <JuiRightRailContentLoading delay={LOADING_DELAY} />
      ),
      loadingMoreRenderer: () => <JuiRightRailLoadingMore />,
      stickToLastPosition: false,
    };
  }

  private _renderItems() {
    const {
      listHandler,
      Cell,
      isHover,
      resetSelectIndex,
      selectIndexChange,
      automationID,
    } = this.props;
    return listHandler.sortableListStore.getIds.map(
      (itemId: number, cellIndex: number) => (
        <Cell
          onMouseLeave={resetSelectIndex}
          isHover={isHover(cellIndex)}
          onMouseOver={selectIndexChange(cellIndex)}
          id={itemId}
          key={itemId}
          automationID={`${automationID}-cell-${itemId}`}
        />
      ),
    );
  }

  private get _noRowsRenderer() {
    const { t, searchKey, automationID, empty } = this.props;
    const {
      noResultTip,
      noResultImage,
      noMatchesFoundTip,
      noMatchesFoundImage,
    } = empty;

    const message = searchKey
      ? t(noMatchesFoundTip ? noMatchesFoundTip : '')
      : t(noResultTip);

    const image = searchKey ? noMatchesFoundImage : noResultImage;

    return (
      <JuiEmptyPage
        data-test-automation-id={`${automationID}-empty-page`}
        image={image}
        message={message}
      />
    );
  }

  private _onFilterChange = debounce(this.props.setSearchKey, DELAY_DEBOUNCE);

  private get _filterRenderer() {
    const { t, filter } = this.props;

    return (
      filter && (
        <JuiPhoneFilter
          placeholder={t(filter.placeholder)}
          clearButtonLabel={t('common.clearText')}
          tooltip={t('common.clear')}
          onChange={this._onFilterChange}
        />
      )
    );
  }

  render() {
    const {
      t,
      title,
      automationID,
      listHandler,
      isError,
      onErrorReload,
    } = this.props;
    return (
      <JuiAutoSizer>
        {({ height }) => {
          return (
            height && (
              <Observer>
                {() => (
                  <>
                    <JuiConversationPageHeader
                      title={t(title)}
                      data-test-automation-id={`${automationID}-header`}
                      Right={this._filterRenderer}
                    />
                    <LayoutMain
                      data-test-automation-id={`${automationID}-list`}
                    >
                      {isError ? (
                        <ErrorPage onReload={onErrorReload} />
                      ) : (
                        listHandler && (
                          <DataList
                            initialDataCount={INITIAL_COUNT}
                            listHandler={listHandler}
                            reverse
                            InfiniteListProps={Object.assign(
                              this._getDefaultListProps,
                              {
                                loadMoreStrategy: this._loadMoreStrategy,
                                height: height - LIST_HEADER_HEIGHT,
                              },
                            )}
                          >
                            {this._renderItems()}
                          </DataList>
                        )
                      )}
                    </LayoutMain>
                  </>
                )}
              </Observer>
            )
          );
        }}
      </JuiAutoSizer>
    );
  }
}

const ListMainView = withTranslation('translations')(ListMainViewComponent);

export { ListMainView };
