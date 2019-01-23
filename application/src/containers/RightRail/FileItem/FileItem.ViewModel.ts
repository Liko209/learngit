/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-09 14:13:08
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
  get personName() {
    if (this.file) {
      const { creatorId } = this.file;
      if (creatorId) {
        return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId)
          .userDisplayName;
      }
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

  @computed
  get fileTypeOrUrl() {
    if (this.file) {
      const { type } = this.file;
      const { isImage, previewUrl } = this.isImage(this.file);
      const thumb = {
        icon: '',
        url: '',
      };
      if (isImage) {
        thumb.url = previewUrl;
        return thumb;
      }
      thumb.icon = (type && type.split('/').pop()) || '';
      return thumb;
    }
    return '';
  }

  isImage(fileItem: FileItemModel) {
    const { type, previewUrl } = getFileType(fileItem);
    return {
      previewUrl,
      isImage: type === FileType.image,
    };
  }
}

export { FileItemViewModel };
