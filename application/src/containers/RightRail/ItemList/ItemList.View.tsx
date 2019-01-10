/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { ITEM_LIST_TYPE } from '../types';
import { ViewProps, Props } from './types';
import { FileItem } from '../FileItem';
import { JuiListSubheader } from 'jui/components/Lists';
import {
  JuiVirtualList,
  IVirtualListDataSource,
} from 'jui/pattern/VirtualList';
import { JuiConversationRightRailLoading } from 'jui/pattern/RightShelf';
import { observable } from 'mobx';
import { emptyView } from './Empty';

const itemType = {
  [ITEM_LIST_TYPE.FILE]: FileItem,
};

const subheaderType = {
  [ITEM_LIST_TYPE.FILE]: 'fileListSubheader',
};

@observer
class ItemListView extends React.Component<ViewProps & Props>
  implements IVirtualListDataSource {
  countOfCell() {
    const { totalCount } = this.props;
    return totalCount;
  }

  cellAtIndex = (index: number, style: React.CSSProperties) => {
    const { ids, type } = this.props;
    const Component: any = itemType[type];
    const id = ids[index];
    return (
      <div key={index} style={style}>
        {id ? <Component id={id} /> : <JuiConversationRightRailLoading />}
      </div>
    );
  }

  fixedCellHeight() {
    return 52;
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
    return await this.props.fetchNextPageItems();
  }

  render() {
    const { type, totalCount } = this.props;
    const subheaderText = subheaderType[type];
    const source = observable({ source: this.props });
    return (
      <>
        {totalCount > 0 && (
          <JuiListSubheader>
            {t(subheaderText)} ({totalCount})
          </JuiListSubheader>
        )}
        <JuiVirtualList dataSource={this} source={source} />
      </>
    );
  }
}

export { ItemListView };
