/*
 * @Author: Paynter Chen
 * @Date: 2019-05-08 15:16:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  IZipItemProvider,
  ZipItem,
  ZipItemLevel,
} from 'sdk/service/uploadLogControl/types';

export class ElectronZipItemProvider implements IZipItemProvider {
  level: ZipItemLevel = ZipItemLevel.NORMAL;
  getZipItems = async () => {
    const logs =
      (window.jupiterElectron.getLogs && window.jupiterElectron.getLogs()) ||
      [];
    const logContent = logs
      .map((log: { message: string }) => {
        return log.message;
      })
      .join('\n');
    return [
      {
        type: '.txt',
        name: 'ElectronLog',
        content: logContent,
      } as ZipItem,
    ];
  }
}
