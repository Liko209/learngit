/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 11:22:52
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel, {
  ExtendFileItem,
  FileType,
} from '@/store/models/FileItem';

const IMAGE_TYPE = ['gif', 'jpeg', 'png', 'jpg'];

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

  if (document(item).isDocument) {
    fileType.type = FileType.document;
    fileType.previewUrl = document(item).previewUrl;
    return fileType;
  }

  fileType.type = FileType.others;
  return fileType;
}

function image(item: FileItemModel) {
  const { thumbs, type, versionUrl } = item;
  const image = {
    isImage: false,
    previewUrl: '',
  };

  if (thumbs) {
    for (const key in thumbs) {
      const value = thumbs[key];
      if (typeof value === 'string' && value.indexOf('http') > -1) {
        image.isImage = true;
        image.previewUrl = thumbs[key];
      }
    }
  }

  // In order to show image
  // If upload doc and image together, image will not has thumbs
  // FIXME: FIJI-2565
  if (type) {
    const isImage = IMAGE_TYPE.some(looper => type.includes(looper));
    if (type.includes('image/') || isImage) {
      image.isImage = true;
      image.previewUrl = versionUrl || '';
      return image;
    }
  }
  return image;
}

function document(item: FileItemModel) {
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

export { getFileType };
