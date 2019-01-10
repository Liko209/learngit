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
import { FilesProps } from './types';

class FileItemViewModel extends AbstractViewModel<FilesProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get file() {
    const id = this._id;
    if (typeof id !== 'undefined') {
      return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this._id);
    }
    return null;
  }

  @computed
  get subTitle() {
    const file = this.file;
    if (file) {
      const personName = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        file.creatorId,
      ).userDisplayName;

      return personName;
    }
    return '';
  }

  @computed
  get fileType() {
    const file = this.file;
    if (file) {
      return file.type && file.type.split('/').pop();
    }
    return '';
  }
}

export { FileItemViewModel };
