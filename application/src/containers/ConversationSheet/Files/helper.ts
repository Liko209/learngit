/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-13 14:25:00
 * Copyright © RingCentral. All rights reserved.
 */
function getFileSize(bytes: number) {
  if (bytes / 1024 < 1000) {
    return `${(bytes / 1024).toFixed(1)}Kb`;
  }
  if (bytes / 1024 / 1024 < 1000) {
    return `${(bytes / 1024 / 1024).toFixed(1)}Mb`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}Gb`;
}

export { getFileSize };
