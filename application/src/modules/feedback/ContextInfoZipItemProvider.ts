/*
 * @Author: Paynter Chen
 * @Date: 2019-05-04 17:11:51
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IZipItemProvider,
  ZipItem,
  ZipItemLevel,
} from 'sdk/service/uploadLogControl/types';
import { getAppContextInfo } from '@/utils/error';

export class ContextInfoZipItemProvider implements IZipItemProvider {
  level: ZipItemLevel = ZipItemLevel.NORMAL;
  getZipItems = async () => {
    const contextInfo = await getAppContextInfo();
    const contextContent = Object.keys(contextInfo)
      .map((key: string) => {
        return `${key}: ${contextInfo[key]}`;
      })
      .join('\n');
    return [
      {
        type: '.txt',
        name: 'ContextInfo',
        content: contextContent,
      } as ZipItem,
    ];
  }
}
