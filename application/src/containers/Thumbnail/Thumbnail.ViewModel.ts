/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, comparer, action } from 'mobx';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import FileItemModel, { FileType } from '@/store/models/FileItem';
import { StoreViewModel } from '@/store/ViewModel';
import { getFileType } from '@/common/getFileType';
import { getThumbnailURLWithType } from '@/common/getThumbnailURL';
import { Props, ViewProps } from './types';
import { RULE } from '@/common/generateModifiedImageURL';

class ThumbnailViewModel extends StoreViewModel<Props> implements ViewProps {
  static DEFAULT_WIDTH = 36;
  static DEFAULT_HEIGHT = 36;
  @observable
  thumbsUrlWithSize: string;
  @observable
  _lastStoreFileId: number;

  constructor(props: Props) {
    super(props);
    this.reaction(() => ({ id: this._id }), this._getThumbsUrlWithSize, {
      fireImmediately: true,
      equals: comparer.structural,
    });
  }

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  get file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @action
  private _getThumbsUrlWithSize = async () => {
    const { id, type, versions } = this.file;
    if (versions[0].stored_file_id !== this._lastStoreFileId) {
      const thumbnail = await getThumbnailURLWithType(
        {
          id,
          type,
          versions,
          versionUrl: versions.length && versions[0].url ? versions[0].url : '',
        },
        RULE.SQUARE_IMAGE,
      );
      this._lastStoreFileId = versions[0].stored_file_id;
      this.thumbsUrlWithSize = thumbnail.url;
    }
  }

  @computed get icon() {
    const file = this.file;
    return file.iconType || '';
  }

  isImage(fileItem: FileItemModel) {
    const { type, previewUrl } = getFileType(fileItem);
    return {
      previewUrl,
      isImage: type === FileType.image,
    };
  }
}

export { ThumbnailViewModel };
