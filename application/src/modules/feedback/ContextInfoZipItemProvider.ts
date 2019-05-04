/*
 * @Author: Paynter Chen
 * @Date: 2019-05-04 17:11:51
 * Copyright © RingCentral. All rights reserved.
 */
import { IZipItemProvider, ZipItem } from 'sdk/service/uploadLogControl/types';
import { getAppContextInfo } from '@/utils/error';

export class ContextInfoZipItemProvider implements IZipItemProvider {
  constructor() {}

  getZipItems = async () => {
    getAppContextInfo();
    const contextInfo = await getAppContextInfo();
    const contextContent = Object.keys(contextInfo)
      .map(key => {
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
