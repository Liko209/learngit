/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 11:22:52
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel, {
  ExtendFileItem,
  FileType,
} from '@/store/models/FileItem';
import { FILE_ICON_MAP } from './getFileIcon';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';

function image(item: FileItemModel) {
  const { type, versionUrl, name } = item;
  const images = {
    isImage: false,
    previewUrl: '',
  };

  // In order to show image
  // If upload doc and image together, image will not has thumbs
  // FIXME: FIJI-2565
  let isImage = false;
  let t = '';
  if (type) {
    t = type.toLowerCase();
  } else if (name) {
    t = (name && name.split('.').pop()) || '';
    t = t.toLowerCase();
  }

  isImage = FileItemUtils.isSupportPreview({ type: t }) || t.includes('image/');
  if (isImage) {
    images.isImage = true;
    images.previewUrl = versionUrl;
  }
  return images;
}

function documentType(item: FileItemModel) {
  const { pages } = item;
  const doc = {
    isDocument: false,
    previewUrl: '',
  };
  if (pages.length > 0) {
    doc.isDocument = true;
    doc.previewUrl = pages[0].url;
  }
  return doc;
}

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

const VIEWER_SUPPORT_TYPE = ['doc', 'docx', 'ppt', 'pptx'];
function isSupportFileViewer(type: string): boolean {
  return VIEWER_SUPPORT_TYPE.some(v => type === v);
}

function isDoc(type: string): boolean {
  return FILE_ICON_MAP.doc.some(v => type === v);
}

function isFileReadyForViewer(status?: string, ready?: boolean): boolean {
  return ready || status === 'ready';
}

export {
  getFileType,
  image,
  documentType,
  isSupportFileViewer,
  isFileReadyForViewer,
  isDoc,
};
