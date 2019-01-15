/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 10:53:30
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import FileItemModel, { FileType } from '@/store/models/FileItem';
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
    const id = this._id;
    if (typeof id !== 'undefined') {
      return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this._id);
    }
    return null;
  }

  @computed
  get subTitle() {
    if (this.file) {
      const { createdAt, creatorId } = this.file;
      const personName = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        creatorId,
      ).userDisplayName;
      return `${personName} · ${dateFormatter.date(createdAt)}`;
    }
    return '';
  }

  @computed
  get url() {
    if (this.file) {
      const { isImage, previewUrl } = this.isImage(this.file);
      if (isImage) {
        return previewUrl;
      }
    }
    return '';
  }

  isImage(ImageItem: FileItemModel) {
    const { type, previewUrl } = getFileType(ImageItem);
    return {
      previewUrl,
      isImage: type === FileType.image,
    };
  }
}

export { ImageItemViewModel };
