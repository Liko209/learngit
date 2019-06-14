/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 16:16:36
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogUtils } from '../utils';
import { Config } from '../config';

const logger = LogUtils.getLogger(__filename);

const REPORT_DIR_PATH = path.join(process.cwd(), Config.reportUri);

class FileService {
  /**
   * @description: check report path, not exist will create
   */
  static async checkReportPath() {
    if (!fs.existsSync(REPORT_DIR_PATH)) {
      fs.mkdirSync(REPORT_DIR_PATH);
    }
  }

  /**
   * @description: save dashboard into disk
   */
  static async saveDashboardIntoDisk(dashboard: string, browser: string) {
    await FileService.checkReportPath();
    let dashboardPath = path.join(REPORT_DIR_PATH, `${browser}.dashboard.html`);
    fs.writeFileSync(dashboardPath, dashboard);
    logger.info(`dashboard has saved.[${dashboardPath}]`);
  }

  /**
   * @description: save dashboard into disk
   */
  static async saveGlipMessageIntoDisk(message: string, browser: string) {
    await FileService.checkReportPath();
    let messagePath = path.join(REPORT_DIR_PATH, `${browser}.glip.txt`);
    fs.writeFileSync(messagePath, message);
    logger.info(`glip message has saved.[${messagePath}]`);
  }
}

export {
  FileService
}
