/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { RIGHT_RAIL_ITEM_TYPE } from './constants';
import { ViewProps, Props } from './types';
import { FileItem } from '../FileItem';
import { LinkItem } from '../LinkItem';
import { JuiListSubheader } from 'jui/components/Lists';
import { debounce } from 'lodash';
import {
  JuiVirtualList,
  IVirtualListDataSource,
} from 'jui/pattern/VirtualList';
import {
  JuiConversationRightRailLoading,
  JuiRightShelfContent,
} from 'jui/pattern/RightShelf';
import { emptyView } from './Empty';

const itemType = {
  [RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES]: FileItem,
  [RIGHT_RAIL_ITEM_TYPE.LINKS]: LinkItem,
};

const subheaderType = {
  [RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES]: 'fileListSubheader',
  [RIGHT_RAIL_ITEM_TYPE.LINKS]: 'linkListSubheader',
};

@observer
class ItemListView extends React.Component<ViewProps & Props>
  implements IVirtualListDataSource {
  private _fetchMore: any;
  constructor(props: ViewProps & Props) {
    super(props);
    this._fetchMore = debounce(this.props.fetchNextPageItems, 200);
  }
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
    return await this._fetchMore();
  }

  render() {
    const { type, totalCount } = this.props;
    const subheaderText = subheaderType[type];
    return (
      <JuiRightShelfContent>
        {totalCount > 0 && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {t(subheaderText)} ({totalCount})
          </JuiListSubheader>
        )}
        <JuiVirtualList dataSource={this} />
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
