/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, comparer } from 'mobx';
import { ItemService } from 'sdk/module/item/service';
import { FileItemUtils } from 'sdk/module/item/utils';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import FileItemModel, { FileType } from '@/store/models/FileItem';
import { StoreViewModel } from '@/store/ViewModel';
import { getFileType } from '@/common/getFileType';
import { Props, ViewProps } from './types';

type Size = {
  width: number;
  height: number;
};

class ThumbnailViewModel extends StoreViewModel<Props> implements ViewProps {
  static DEFAULT_WIDTH = 36;
  static DEFAULT_HEIGHT = 36;
  @observable
  private _thumbsUrlWithSize: string;

  constructor(props: Props) {
    super(props);
    this.reaction(
      () => ({ size: this._size, id: this._id }),
      this._getThumbsUrlWithSize,
      {
        fireImmediately: true,
        equals: comparer.structural,
      },
    );
  }

  @computed
  private get _size() {
    const { origWidth, origHeight } = this.file;
    const size: Size = {
      width: ThumbnailViewModel.DEFAULT_WIDTH,
      height: ThumbnailViewModel.DEFAULT_WIDTH,
    };
    if (origWidth && origHeight) {
      if (origWidth > origHeight) {
        size.width = Math.max(
          Math.round(
            (origWidth / origHeight) * ThumbnailViewModel.DEFAULT_WIDTH,
          ),
          ThumbnailViewModel.DEFAULT_WIDTH,
        );
      } else {
        size.height = Math.max(
          Math.round(
            (origHeight / origWidth) * ThumbnailViewModel.DEFAULT_WIDTH,
          ),
          ThumbnailViewModel.DEFAULT_WIDTH,
        );
      }
    }
    return size;
  }

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  get file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.FILE_ITEM, this._id);
  }

  private _getThumbsUrlWithSize = async () => {
    const itemService = ItemService.getInstance() as ItemService;

    const { width, height } = this._size;
    this._thumbsUrlWithSize = await itemService.getThumbsUrlWithSize(
      this._id,
      width,
      height,
    );
  }

  @computed
  get fileTypeOrUrl() {
    const thumb = {
      icon: '',
      url: '',
    };

    if (this.file && this.file.type) {
      // const { previewUrl, isImage } = this.isImage(this.file);
      // if (isImage) {
      if (FileItemUtils.isSupportPreview(this.file)) {
        thumb.url = this._thumbsUrlWithSize;
        return thumb;
      }
      // thumb.url = previewUrl;
      // return thumb;
      // }

      thumb.icon = this.file.iconType;
      return thumb;
    }
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

export { ThumbnailViewModel };
