/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, comparer, action } from 'mobx';
// import { ItemService } from 'sdk/module/item/service';
// import { FileItemUtils } from 'sdk/module/item/utils';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import FileItemModel, { FileType } from '@/store/models/FileItem';
import { StoreViewModel } from '@/store/ViewModel';
import { getFileType } from '@/common/getFileType';
import {
  // getThumbnailURL,
  getThumbnailURLWithType,
} from '@/common/getThumbnailURL';
import { Props, ViewProps } from './types';
import { RULE } from '@/common/generateModifiedImageURL';

type Size = {
  width: number;
  height: number;
};

class ThumbnailViewModel extends StoreViewModel<Props> implements ViewProps {
  static DEFAULT_WIDTH = 36;
  static DEFAULT_HEIGHT = 36;
  @observable
  thumbsUrlWithSize: string;

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
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @action
  private _getThumbsUrlWithSize = async () => {
    // const itemService = ItemService.getInstance() as ItemService;

    // const { width, height } = this._size;
    // this._thumbsUrlWithSize = await itemService.getThumbsUrlWithSize(
    //   this._id,
    //   width,
    //   height,
    // );
    const file = this.file;
    const thumbnail = await getThumbnailURLWithType(
      {
        id: file.id,
        type: file.type,
        versionUrl:
          file.versions.length && file.versions[0].url
            ? file.versions[0].url
            : '',
        versions: file.versions,
      },
      RULE.SQUARE_IMAGE,
    );
    this.thumbsUrlWithSize = thumbnail.url;
  }

  @computed get icon() {
    const file = this.file;
    return file.iconType || '';
  }

  // @computed
  // get fileTypeOrUrl() {
  //   const file = this.file;
  //   const thumb = {
  //     icon: file.iconType || '',
  //     url: '',
  //   };

  //   if (file && file.type) {
  //     let url: string;
  //     if (FileItemUtils.isGifItem(file)) {
  //       url = file.versionUrl!;
  //     } else {
  //       url = getThumbnailURL(
  //         {
  //           id: file.id,
  //           type: file.type,
  //           versionUrl: file.versionUrl || '',
  //           versions: file.versions,
  //         },
  //         this._size,
  //       ) as string;
  //       console.log(url, file.versions[0].stored_file_id, 'shining22222222');
  //     }
  //     if (
  //       !url &&
  //       FileItemUtils.isSupportPreview(file) &&
  //       file.origHeight &&
  //       file.origWidth
  //     ) {
  //       url = this._thumbsUrlWithSize;
  //       console.log(url, file.versions[0].stored_file_id, 'shining333333');
  //     }
  //     if (!url) {
  //       url = file.versionUrl!;
  //       console.log(url, file.versions[0].stored_file_id, 'shining4444444');
  //     }
  //     thumb.url = url;
  //   }
  //   return thumb;
  // }

  isImage(fileItem: FileItemModel) {
    const { type, previewUrl } = getFileType(fileItem);
    return {
      previewUrl,
      isImage: type === FileType.image,
    };
  }
}

export { ThumbnailViewModel };
