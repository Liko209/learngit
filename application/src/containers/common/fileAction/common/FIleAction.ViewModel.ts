/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { Item } from 'sdk/module/item/entity';
import FileItemModel from '@/store/models/FileItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { StoreViewModel } from '@/store/ViewModel';
import { FileActionProps, IFileActionBaseViewModel } from './types';

class FileActionViewModel<P = {}> extends StoreViewModel<FileActionProps & P>
  implements IFileActionBaseViewModel {
  @computed
  get fileId() {
    return this.props.fileId;
  }

  @computed
  get item() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this.fileId);
  }

  @computed
  get fileName() {
    return this.item.name;
  }
}

export { FileActionViewModel };
