/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */

import * as filestack from 'filestack-js';
import JSZip from 'jszip';
import { mainLogger } from 'sdk';
import { LogControlManager } from 'sdk/service/uploadLogControl/logControlManager';
import { FILE_STACK_API_KEY } from '../constants';
import { UploadResult } from '../types';
import { getAppContextInfo } from '@/utils/error';

class FeedbackService {
  uploadRecentLogs = async (): Promise<UploadResult | null> => {
    const recentLogs = LogControlManager.instance().getRecentLogs();
    if (recentLogs.length < 1) {
      mainLogger.debug('Recent logs is empty');
      return null;
    }
    const contextInfo = await getAppContextInfo();
    const contextContent = Object.keys(contextInfo)
      .map(key => {
        return `${key}: ${contextInfo[key]}`;
      })
      .join('\n');
    const logFileName = `LOG_${recentLogs[0].sessionId}`;
    const logContent = recentLogs
      .map((log, index: number) => {
        return `${index}: ${log.message}`;
      })
      .join('\n');
    const client = filestack.init(FILE_STACK_API_KEY);
    const zip = new JSZip();
    zip.file('ContextInfo.txt', contextContent);
    zip.file(`${logFileName}.txt`, logContent);
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    return await client.upload(
      zipBlob,
      {
        onProgress: (evt: { totalPercent: number; totalBytes: number }) => {},
        timeout: 60 * 1000,
        retry: 1,
      },
      {
        filename: `${logFileName}.zip`,
      },
    );
  }
}

export { FeedbackService };
