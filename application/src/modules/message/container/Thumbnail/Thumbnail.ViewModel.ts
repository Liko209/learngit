/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import FileItemModel from '@/store/models/FileItem';
import { StoreViewModel } from '@/store/ViewModel';
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
    this.reaction(
      () => this._file.versions && this._file.versions.length, // According to file's versions to decide update/create thumbnail or not
      this._getThumbsUrlWithSize,
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _file() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @action
  private _getThumbsUrlWithSize = async () => {
    const { id, type, versions } = this._file;
    const version = versions && versions[0];
    if (version) {
      if (version.stored_file_id !== this._lastStoreFileId) {
        const thumbnail = await getThumbnailURLWithType(
          {
            id,
            type,
            versions,
            versionUrl: version.url || '',
          },
          RULE.SQUARE_IMAGE,
        );
        this._lastStoreFileId = version.stored_file_id;
        this.thumbsUrlWithSize = thumbnail.url;
      }
    } else {
      this._lastStoreFileId = -1;
      this.thumbsUrlWithSize = this._file.downloadUrl;
    }
  }

  @computed get icon() {
    return this._file.iconType || '';
  }
}

export { ThumbnailViewModel };
