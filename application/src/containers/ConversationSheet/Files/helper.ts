/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:00
 * Copyright © RingCentral. All rights reserved.
 */
function getFileSize(bytes: number) {
  if (bytes < 100) {
    return `${(bytes).toFixed(1)}B`;
  }
  if (bytes / 1024 < 1000) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  if (bytes / 1024 / 1024 < 1000) {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
}

export { getFileSize };
