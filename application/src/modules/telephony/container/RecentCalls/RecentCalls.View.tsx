/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { JuiRecentCalls, JuiEmptyPage } from 'jui/pattern/Dialer';
import { ViewProps } from './types';
import { RecentCallItem } from '../RecentCallItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import noCallLogImage from '@/modules/phone/container/images/no-call.svg';
import { RECENT_CALL_ITEM_HEIGHT, INITIAL_COUNT } from './config';
import { ErrorPage } from '@/modules/common/container/ErrorPage';
import { DataList } from '@/modules/common/container/DataList';
import { HotKeys } from 'jui/hoc/HotKeys';
import { JuiVirtualizedListHandles } from 'jui/components/VirtualizedList';

type Props = ViewProps & WithTranslation;
type State = {
  height: number;
};
const MAX_COUNT = 7;
@observer
class RecentCallsComponent extends React.Component<Props, State> {
  private _containerRef: React.RefObject<any> = createRef();
  private _listRef: React.RefObject<JuiVirtualizedListHandles> = createRef();
  private _dataList = React.createRef<DataList>();
  private _infiniteListProps = {
    minRowHeight: RECENT_CALL_ITEM_HEIGHT,
    loadingRenderer: () => <div />, // TODO add loading
    loadingMoreRenderer: () => <div />, // TODO add loading more
    stickToLastPosition: false,
  };
  private _handleClickMap = {};

  private _handleClick = (index: number) => {
    const { handleClick } = this.props;
    if (this._handleClickMap[index]) {
      return this._handleClickMap[index];
    }
    return (this._handleClickMap[index] = () => handleClick(index));
  };

  state = {
    height: 0,
  };

  componentDidMount() {
    /* eslint-disable  react/no-find-dom-node */
    const container = ReactDOM.findDOMNode(this._containerRef.current);
    if (container) {
      this.setState({
        height: (container as HTMLDivElement).offsetHeight,
      });
    }
  }
  private get _noRowsRenderer() {
    const { t } = this.props;

    return (
      <JuiEmptyPage
        data-test-automation-id="recentCallsEmptyPage"
        image={noCallLogImage}
        message={t('phone.noCallLogAvailable')}
      />
    );
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.isTransferPage !== this.props.isTransferPage) {
      this._handleClickMap = {};
    }
  }

  private _scrollToView = (fn: () => void) => {
    const { dialerInputFocused } = this.props;
    if (!dialerInputFocused || !this._listRef.current) {
      return;
    }
    fn();
    const { focusIndex } = this.props;

    const { startIndex, stopIndex } = this._listRef.current.getVisibleRange();

    if (focusIndex >= stopIndex) {
      this._dataList.current &&
        this._dataList.current.loadMore('down', MAX_COUNT);
    }

    if (this._listRef.current) {
      if (focusIndex <= startIndex) {
        this._listRef.current.scrollToIndex(focusIndex);
      } else if (focusIndex >= stopIndex) {
        this._listRef.current.scrollToIndex(focusIndex);
      }
    }
  };

  onKeyDown = () => {
    const { increaseFocusIndex } = this.props;
    this._scrollToView(increaseFocusIndex);
  };

  onKeyUp = () => {
    const { decreaseFocusIndex } = this.props;
    this._scrollToView(decreaseFocusIndex);
  };

  onEnter = () => {
    const { makeCall, selectCallItem, isTransferPage } = this.props;
    isTransferPage ? selectCallItem() : makeCall();
  };

  private _renderItems() {
    const { listHandler, focusIndex } = this.props;
    return listHandler
      ? listHandler.sortableListStore.getIds.map((itemId: string, index) => (
          <RecentCallItem
            id={itemId}
            key={itemId}
            selected={focusIndex === index}
            onClick={this._handleClick(index)}
            itemIndex={index}
          />
        ))
      : [];
  }
  render() {
    const {
      listHandler,
      isError,
      onErrorReload,
      displayCallerIdSelector,
    } = this.props;
    const { height } = this.state;

    return (
      <HotKeys
        keyMap={{
          up: this.onKeyUp,
          down: this.onKeyDown,
          enter: this.onEnter,
        }}
        global
      >
        <JuiRecentCalls
          ref={this._containerRef}
          addMargin={displayCallerIdSelector}
        >
          {isError ? (
            <ErrorPage onReload={onErrorReload} height={height} />
          ) : (
            listHandler && (
              <DataList
                initialDataCount={INITIAL_COUNT}
                listHandler={listHandler}
                reverse
                InfiniteListProps={Object.assign(this._infiniteListProps, {
                  height,
                  ref: this._listRef,
                  noRowsRenderer: this._noRowsRenderer,
                })}
              >
                {this._renderItems()}
              </DataList>
            )
          )}
        </JuiRecentCalls>
      </HotKeys>
    );
  }
}

const RecentCallsView = withTranslation('translations')(RecentCallsComponent);

export { RecentCallsView };
