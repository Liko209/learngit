import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import * as debug from 'debug';
import { AxiosInstance } from 'axios';
import * as axiosDebug from 'axios-debug-log';

import { TMPFILE_PATH, RUNNER_OPTS } from '../config';
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
    if (!fs.existsSync(TMPFILE_PATH)) {
      fs.mkdirSync(TMPFILE_PATH);
    }
    const filepath = path.join(TMPFILE_PATH, filename);
    fs.writeFileSync(filepath, content);
    return filepath;
  }

  static async convertToWebp(imagePath: string, quality: string | number = 50, scale: number = 0.5) {
    if (path.extname(imagePath) == '.webp' || !fs.existsSync(imagePath)) {
      return imagePath;
    }
    try {
      const webpImagePath = imagePath + ".webp";
      const image = sharp(imagePath);
      await image
        .metadata()
        .then(function (metadata) {
          return image
            .resize(Math.round(metadata.width * scale))
            .webp({ quality })
            .toBuffer();
        })
        .then((data) => {
          fs.writeFileSync(webpImagePath, data)
        });
      return webpImagePath;
    } catch {
      return imagePath;
    }
  }

  static createDirIfNotExists(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
  }

  static axiosDebugConfig() {
    axiosDebug({
      request: function (debug, config) {
      },
      response: function (debug, response) {
      },
      error: function (debug, error) {
        // Read https://www.npmjs.com/package/axios#handling-errors for more info
        if (error.response) {
          debug(error.response.data);
          debug(error.response.status);
          debug(error.response.headers);
        } else if (error.request) {
          debug(error.request);
        } else {
          debug('Error', error.message);
        }
        debug(error.config);
      }
    });
  }

  static addDebugLog(sdk: AxiosInstance, Indentifier: string) {
    const rcLogger = require('debug')(Indentifier)
    axiosDebug.enable(process.env.DEBUG);
    axiosDebug.addLogger(sdk, rcLogger);
  }
}
