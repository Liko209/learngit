/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 11:22:52
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel, {
  ExtendFileItem,
  FileType,
} from '@/store/models/FileItem';

import { FileItemUtils } from 'sdk/module/item/module/file/utils';

function getFileType(item: FileItemModel): ExtendFileItem {
  const fileType: ExtendFileItem = {
    item,
    type: -1,
    previewUrl: '',
  };

  if (image(item).isImage) {
    fileType.type = FileType.image;
    fileType.previewUrl = image(item).previewUrl;
    return fileType;
  }

  if (documentType(item).isDocument) {
    fileType.type = FileType.document;
    fileType.previewUrl = documentType(item).previewUrl;
    return fileType;
  }

  fileType.type = FileType.others;
  return fileType;
}

function image(item: FileItemModel) {
  const { type, versionUrl } = item;
  const image = {
    isImage: false,
    previewUrl: '',
  };

  // In order to show image
  // If upload doc and image together, image will not has thumbs
  // FIXME: FIJI-2565
  if (type) {
    const t = type.toLocaleLowerCase();
    if (FileItemUtils.isSupportPreview({ type }) || t.includes('image/')) {
      image.isImage = true;
      image.previewUrl = versionUrl || ''; // Warning: This one needs to be scrapped. You can't use the original
      return image;
    }
  }

  return image;
}

function documentType(item: FileItemModel) {
  const { pages } = item;
  const doc = {
    isDocument: false,
    previewUrl: '',
  };
  if (pages && pages.length > 0) {
    doc.isDocument = true;
    doc.previewUrl = pages[0].url;
  }
  return doc;
}

export { getFileType, image, documentType };
