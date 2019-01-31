/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
import { ITEM_HEIGHT } from './config';
import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellWrapper,
} from 'jui/pattern/VirtualList';
import { emptyView } from './Empty';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { debounce } from 'lodash';
const LOAD_DELAY = 300;
import ReactResizeDetector from 'react-resize-detector';

const HEADER_HEIGHT = 36;
@observer
class ItemListView extends React.Component<ViewProps & Props>
  implements IVirtualListDataSource {
  private _loadData: Function;
  constructor(props: ViewProps & Props) {
    super(props);
    this._loadData = debounce(async () => {
      const { loadStatus, ids, totalCount } = this.props;
      const { firstLoaded, loading } = loadStatus;
      if ((firstLoaded && ids.length === totalCount) || loading) {
        return;
      }
      await this.props.fetchNextPageItems();
    },                        LOAD_DELAY);
  }

  countOfCell() {
    const { ids, loadStatus } = this.props;
    const { loading } = loadStatus;
    return loading ? ids.length + 1 : ids.length;
  }

  cellAtIndex = (index: number, style: CSSProperties) => {
    const { ids, tabConfig } = this.props;
    const Component: any = tabConfig.item;
    const id = ids[index];
    let content;
    if (id) {
      content = <Component id={id} />;
    }

    return (
      <JuiVirtualCellWrapper key={index} style={style}>
        {content}
      </JuiVirtualCellWrapper>
    );
  }

  fixedCellHeight() {
    return ITEM_HEIGHT;
  }

  renderEmptyContent = () => {
    const { type } = this.props;
    return emptyView(type);
  }

  isRowLoaded = (index: number) => {
    const { ids } = this.props;
    const result = typeof ids[index] !== 'undefined';
    return result;
  }

  loadMore = async (startIndex: number, stopIndex: number) => {
    await this._loadData();
  }

  firstLoader = () => {
    return <JuiRightRailContentLoading />;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  render() {
    const { totalCount, ids, loadStatus, tabConfig } = this.props;
    const { loading, firstLoaded } = loadStatus;
    const { subheader } = tabConfig;
    return (
      <JuiRightShelfContent>
        {firstLoaded && totalCount > 0 && ids.length > 0 && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {i18next.t(subheader)} ({totalCount})
          </JuiListSubheader>
        )}
        {firstLoaded && (
          <ReactResizeDetector handleWidth={true} handleHeight={true}>
            {(width: number = 0, height: number = HEADER_HEIGHT) => (
              <JuiVirtualList
                dataSource={this}
                threshold={1}
                isLoading={loading}
                width={width}
                height={height - HEADER_HEIGHT}
              />
            )}
          </ReactResizeDetector>
        )}
        {loading && !firstLoaded && this.firstLoader()}
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
