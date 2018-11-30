import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { TMPFILE_PATH } from '../config';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);

export class MiscUtils {
  static async sleep(time: number): Promise<void> {
    return new Promise<void>((res, rej) => {
      setTimeout(res, time);
    });
  }

  static async retryAsync(cb: () => Promise<any>, errorHandler: (any) => Promise<boolean>, maxRetry: number = 10) {
    let times = 0;
    while (true) {
      try {
        return await cb();
      } catch (err) {
        if (times++ >= maxRetry || !(await errorHandler(err))) {
          throw err;
        }
        logger.warn('retry on error!');
      }
    }
  }

  static createTmpFile(content: any, filename?: string) {
    filename = filename || `${uuid()}.tmp`;
    const filepath = path.join(TMPFILE_PATH, filename);
    fs.writeFileSync(filepath, content);
    return filepath;
  }

  static async convertToWebp(imagePath: string) {
    if (path.extname(imagePath) == '.webp') return imagePath; 
    const webpIamgePath = imagePath + ".webp";
    const image =  sharp(imagePath);
    await image
      .metadata()
      .then(function (metadata) {
        return image
          .resize(Math.round(metadata.width / 2))
          .webp({ quality: 10 })
          .toBuffer();
      })
      .then((data) => {
        fs.writeFileSync(webpIamgePath, data)
      });
    return webpIamgePath;
  }ic 
}
