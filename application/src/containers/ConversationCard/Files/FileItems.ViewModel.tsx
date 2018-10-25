/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
// import { ActionsProps, ActionsViewProps } from './types';
// import { PostService } from 'sdk/service';
import { Item } from 'sdk/models';
import { getEntity } from '@/store/utils';
// import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store';
import ItemModel from '@/store/models/Item';
import { FileItemsViewProps } from './types';

class FileItemsViewModel extends StoreViewModel<FileItemsViewProps> {
  @computed
  get ids() {
    return this.props.ids;
  }

  getFileItems = () => {
    console.log(this.ids, '----file ids');
    this.ids.forEach((id: number) => {
      const item = this.getItem(id);
      console.log(item);
    });
  }

  getItem(id: number) {
    return getEntity<Item, ItemModel>(ENTITY_NAME.ITEM, id);
  }
}

export { FileItemsViewModel };
