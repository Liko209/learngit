/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-04-02 17:56:13
 * Copyright © RingCentral. All rights reserved.
 */

const GIF_FLAG = '.gif';

class FileTypeUtils {
  static isGif(path: string) {
    return path && path.includes(GIF_FLAG);
  }
}

export { FileTypeUtils };
