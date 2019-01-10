/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { ITEM_LIST_TYPE } from '../types';
import { ViewProps, Props } from './types';
import { FileItem } from '../FileItem';
import { JuiListSubheader } from 'jui/components/Lists';

const itemType = {
  [ITEM_LIST_TYPE.FILE]: FileItem,
};

const subheaderType = {
  [ITEM_LIST_TYPE.FILE]: 'fileListSubheader',
};

@observer
class ItemListView extends React.Component<ViewProps & Props> {
  render() {
    const { ids, type, totalCount } = this.props;
    const Component: any = itemType[type];
    const subheaderText = subheaderType[type];

    return (
      <>
        <JuiListSubheader>
          {t(subheaderText)} ({totalCount})
        </JuiListSubheader>
        {ids.map((id: number) => {
          return <Component key={id} id={id} />;
        })}
      </>
    );
  }
}

export { ItemListView };
