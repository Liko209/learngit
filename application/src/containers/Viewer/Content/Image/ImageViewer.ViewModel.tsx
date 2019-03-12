/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { ImageViewerProps } from './types';
import _ from 'lodash';
import { computed, observable } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'sdk';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import FileItemModel from '@/store/models/FileItem';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import { FileItem } from 'sdk/module/item/module/file/entity';
const PAGE_SIZE = 5;

class ImageViewerViewModel extends AbstractViewModel<ImageViewerProps> {
  @observable
  isLoadingMore: boolean = false;

  constructor(props: ImageViewerProps) {
    super(props);
  }

  @computed
  get imageInfo() {
    const item = this.item;
    if (FileItemUtils.isSupportShowRawImage(item)) {
      return {
        url: item.downloadUrl,
        width: item.origWidth,
        height: item.origHeight,
      };
    }
    if (FileItemUtils.isSupportPreview(item)) {
      return getMaxThumbnailURLInfo(item);
    }
    return {
      url: undefined,
      width: 0,
      height: 0,
    };
  }

  @computed
  get imageUrl() {
    return this.imageInfo.url;
  }

  @computed
  get imageWidth() {
    return this.imageInfo.width;
  }

  @computed
  get imageHeight() {
    return this.imageInfo.height;
  }

  @computed
  get item(): FileItemModel {
    return getEntity(ENTITY_NAME.ITEM, this.props.currentItemId);
  }

  @computed
  get hasPrevious() {
    return this.props.currentIndex > 0;
  }

  @computed
  get hasNext() {
    return this.props.currentIndex < this.props.total - 1;
  }

  switchPreImage = () => {
    if (
      this.props.ids.length < 2 ||
      this.props.ids[0] === this.props.currentItemId
    ) {
      if (this.hasPrevious) {
        this._loadMore(QUERY_DIRECTION.OLDER).then((result: FileItem[]) => {
          result && this.switchPreImage();
        });
      } else {
        // should not come here
        mainLogger.warn('can not switchPreImage', {
          ids: this.props.ids,
          currentItemId: this.props.currentItemId,
        });
      }
    } else {
      const nextId = this.props.ids[this._getItemIndex() - 1];
      nextId &&
        this.props.updateCurrentItemIndex(this.props.currentIndex - 1, nextId);
    }
  }

  switchNextImage = () => {
    if (
      this.props.ids.length < 2 ||
      this.props.ids[this.props.ids.length - 1] === this.props.currentItemId
    ) {
      if (this.hasNext) {
        this._loadMore(QUERY_DIRECTION.NEWER).then((result: FileItem[]) => {
          result && this.switchNextImage();
        });
      } else {
        // should not come here
        mainLogger.warn('can not switchNextImage', {
          ids: this.props.ids,
          currentItemId: this.props.currentItemId,
        });
      }
    } else {
      this.props.updateCurrentItemIndex(
        this.props.currentIndex + 1,
        this.props.ids[this._getItemIndex() + 1],
      );
    }
  }

  private _loadMore = async (
    direction: QUERY_DIRECTION,
  ): Promise<FileItem[] | null> => {
    if (this.isLoadingMore) {
      return null;
    }
    this.isLoadingMore = true;
    const result = await this.props.fetchData(direction, PAGE_SIZE);
    this.isLoadingMore = false;
    return result;
  }

  private _getItemIndex = (): number => {
    return this.props.ids.findIndex(
      (_id: number) => _id === this.props.currentItemId,
    );
  }
}

export { ImageViewerViewModel };
