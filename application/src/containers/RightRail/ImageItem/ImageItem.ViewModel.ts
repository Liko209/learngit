/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 10:53:30
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
import { getFileType } from '@/common/getFileType';
import { FilesProps } from './types';

class ImageItemViewModel extends AbstractViewModel<FilesProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this._id);
  }

  @computed
  get _person(): any {
    const { creatorId } = this.file;
    if (creatorId) {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId);
    }
    return {};
  }

  @computed
  get personName() {
    return this._person.userDisplayName || '';
  }

  @computed
  get createdTime() {
    const { createdAt } = this.file;
    return dateFormatter.date(createdAt);
  }

  @computed
  get url() {
    const { previewUrl } = getFileType(this.file);
    return previewUrl;
  }
}

export { ImageItemViewModel };
