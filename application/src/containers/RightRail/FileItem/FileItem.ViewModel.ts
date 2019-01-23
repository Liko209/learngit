/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-09 14:13:08
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import FileItemModel, { FileType } from '@/store/models/FileItem';
import { getFileType } from '@/common/getFileType';
import { FileItemViewProps } from './types';
import { FileViewModel } from '../File.ViewModel';

class FileItemViewModel extends FileViewModel implements FileItemViewProps {
  @computed
  get fileTypeOrUrl() {
    const thumb = {
      icon: '',
      url: '',
    };
    const { type } = this.file;
    if (type) {
      const { isImage, previewUrl } = this._isImage(this.file);
      if (isImage) {
        thumb.url = previewUrl;
        return thumb;
      }
      thumb.icon = (type && type.split('/').pop()) || '';
    }
    return thumb;
  }

  private _isImage(fileItem: FileItemModel) {
    const { type, previewUrl } = getFileType(fileItem);
    return {
      previewUrl,
      isImage: type === FileType.image,
    };
  }
}

export { FileItemViewModel };
