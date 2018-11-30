/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 16:17:22
 * Copyright © RingCentral. All rights reserved.
 */
import { FileItem } from './';

function setFileData(this: FileItem, data: any) {
  const { type, name, versions, is_document, is_new } = data;
  this.type = type;
  this.name = name;
  this.isDocument = is_document;
  this.isNew = is_new;
  if (versions && versions.length > 0) {
    const version = versions[0];
    const {
      url,
      download_url,
      size,
      pages,
      thumbs,
      orig_height,
      orig_width,
    } = version;
    this.url = url;
    this.size = size;
    this.downloadUrl = download_url;
    if (pages && pages.length > 0) {
      this.pages = pages;
    }
    if (thumbs) {
      this.thumbs = thumbs;
    }
    if (orig_height) {
      this.origHeight = orig_height;
    }
    if (orig_width) {
      this.origWidth = orig_width;
    }
  }
}

export { setFileData };
