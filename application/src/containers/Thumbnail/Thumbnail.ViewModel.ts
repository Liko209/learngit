/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { ItemService } from 'sdk/module/item/service';
import { FileItemUtils } from 'sdk/module/item/utils';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import FileItemModel, { FileType } from '@/store/models/FileItem';
import { StoreViewModel } from '@/store/ViewModel';
import { getFileType } from '@/common/getFileType';
import { Props, ViewProps } from './types';

class ThumbnailViewModel extends StoreViewModel<Props> implements ViewProps {
  @observable
  private _thumbsUrlWithSize: string;

  async onReceiveProps() {
    await this._getThumbsUrlWithSize();
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
    const width = this.props.width || 36;
    const height = this.props.height || 36;
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
      const { type } = this.file;
      // const { previewUrl } = this.isImage(this.file);
      if (FileItemUtils.isSupportPreview(this.file)) {
        // thumb.modifyUrl = this._thumbsUrlWithSize;
        thumb.url = this._thumbsUrlWithSize;
        return thumb;
      }
      thumb.icon = (type && type.split('/').pop()) || '';
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
