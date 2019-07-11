import PostModel from '@/store/models/Post';
import FileItemModel from '@/store/models/FileItem';

/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:00
 * Copyright © RingCentral. All rights reserved.
 */
function getFileSize(bytes: number) {
  if (typeof bytes !== 'number') {
    return '0B';
  }
  if (bytes < 100) {
    return `${bytes && bytes.toFixed(1)}B`;
  }
  if (bytes / 1024 < 1000) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  if (bytes / 1024 / 1024 < 1000) {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
}

function fileItemAvailable(item: FileItemModel, post: PostModel) {
  if (item.isMocked || item.deactivated || !item.versions) return false;

  const fileItemVersion = post.fileItemVersion(item);
  const versionIndex = item.versions.length - fileItemVersion;

  if (versionIndex < 0) return false;
  return !item.versions[versionIndex].deactivated;
}

export { getFileSize, fileItemAvailable };
