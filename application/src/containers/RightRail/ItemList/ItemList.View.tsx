/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { ITEM_LIST_TYPE } from '../types';
import { ViewProps, Props } from './types';
import { FileItem } from 'jui/src/pattern/ConversationCard/Files/style';

const itemType = {
  [ITEM_LIST_TYPE.FILE]: FileItem,
};

@observer
class ItemListView extends React.Component<ViewProps & Props> {
  render() {
    const { ids, type } = this.props;
    const Component = itemType[type];

    return (
      <>
        {ids.map((id: number) => {
          <Component id={id} />;
        })}
      </>
    );
  }
}

export { ItemListView };
