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
  get fileTypeOrUrl() {
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

  isImage(fileItem: FileItemModel) {
    const { type, previewUrl } = getFileType(fileItem);
    return {
      previewUrl,
      isImage: type === FileType.image,
    };
  }
}

export { FileItemViewModel };
