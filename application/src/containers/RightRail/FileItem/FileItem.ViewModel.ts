/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-09 14:13:08
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import FileItemModel from '@/store/models/FileItem';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { dateFormatter } from '@/utils/date';
import { FilesProps } from './types';
class FileItemViewModel extends AbstractViewModel<FilesProps> {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get file() {
    const id = this.id;

    return id
      ? getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this.id)
      : null;
  }

  @computed
  get personName() {
    if (this.file) {
      const { creatorId } = this.file;
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId)
        .userDisplayName;
    }
    return '';
  }

  @computed
  get createdTime() {
    if (this.file) {
      const { createdAt } = this.file;
      return dateFormatter.date(createdAt);
    }
    return '';
  }
}

export { FileItemViewModel };
