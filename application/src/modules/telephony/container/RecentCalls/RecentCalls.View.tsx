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
  initialScrollToIndex: number;
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

  state = {
    height: 0,
    initialScrollToIndex: 0,
  };

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this._containerRef.current);
    if (container) {
      this.setState({
        height: (container as HTMLDivElement).offsetHeight,
      });
    }
  }

  // componentDidUpdate() {
  //   const { recentCallsScrollPosition } = this.props;

  //   if (recentCallsScrollPosition) {
  //     this._infiniteListProps.ref.current &&
  //       this._infiniteListProps.ref.current.scrollToPosition(
  //         recentCallsScrollPosition,
  //       );
  //   }
  // }

  // componentWillUnmount() {
  //   if (
  //     this._infiniteListProps.ref.current &&
  //     this._infiniteListProps.ref.current.getScrollPosition()
  //   ) {
  //     this.props.setRecentCallsScrollPosition(
  //       this._infiniteListProps.ref.current.getScrollPosition(),
  //     );
  //   }
  // }

  scrollToView = () => {
    const { focusIndex, startIndex, stopIndex, setRangeIndex } = this.props;

    if (focusIndex >= stopIndex) {
      this._dataList.current &&
        this._dataList.current.loadMore('down', MAX_COUNT);
    }

    if (
      (focusIndex < startIndex || focusIndex >= stopIndex) &&
      this._listRef.current
    ) {
      this._listRef.current.scrollToIndex(focusIndex);

      setRangeIndex({
        startIndex: focusIndex,
        stopIndex: focusIndex + MAX_COUNT,
      });
    }
  }

  onKeyDown = () => {
    const { increaseFocusIndex } = this.props;
    increaseFocusIndex();
    this.scrollToView();
  }

  onKeyUp = () => {
    const { decreaseFocusIndex } = this.props;
    decreaseFocusIndex();
    this.scrollToView();
  }

  // onEnter = (evt: KeyboardEvent) => {
  //   const { onEnter } = this.props;
  //   onEnter(evt);
  //   this.scrollToView();
  // }

  private get _noRowsRenderer() {
    const { t } = this.props;

    return (
      <JuiEmptyPage
        data-test-automation-id="recentCallsEmptyPage"
        image={noCallLogImage}
        message={t('telephony.noCallLogAvailable')}
      />
    );
  }

  private _renderItems() {
    const { listHandler, focusIndex } = this.props;
    return listHandler
      ? listHandler.sortableListStore.getIds.map((itemId: string, index) => {
          return (
            <RecentCallItem
              id={itemId}
              key={itemId}
              selected={focusIndex === index}
            />
          );
        })
      : [];
  }
  render() {
    const { listHandler, isError, onErrorReload, setRangeIndex } = this.props;
    const { height } = this.state;

    return (
      <HotKeys
        keyMap={{
          up: this.onKeyUp,
          down: this.onKeyDown,
          // enter: this.onEnter,
        }}
      >
        <JuiRecentCalls ref={this._containerRef}>
          {isError ? (
            <ErrorPage onReload={onErrorReload} height={height} />
          ) : (
            listHandler && (
              <DataList
                initialDataCount={INITIAL_COUNT}
                listHandler={listHandler}
                reverse={true}
                InfiniteListProps={Object.assign(this._infiniteListProps, {
                  height,
                  ref: this._listRef,
                  noRowsRenderer: this._noRowsRenderer,
                  onVisibleRangeChange: setRangeIndex,
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
