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
  get _id() {
    return this.props.id;
  }

  @computed
  get file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this._id);
  }

  @computed
  get subTitle() {
    const { createdAt, creatorId } = this.file;
    const personName = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      creatorId,
    ).userDisplayName;
    return `${personName} · ${dateFormatter.date(createdAt)}`;
  }

  @computed
  get fileType() {
    return this.file.type && this.file.type.split('/').pop();
  }
}

export { FileItemViewModel };
