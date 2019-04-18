/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */

import { init } from 'filestack-js';
import JSZip from 'jszip';
import { logger } from '../utils';
import { LogControlManager } from 'sdk/service/uploadLogControl/logControlManager';
import { FILE_STACK_API_KEY } from '../constants';
import { UploadResult } from '../types';
import { getAppContextInfo } from '@/utils/error';

class FeedbackService {
  private _fileStackClient: ReturnType<typeof init>;

  private _getFileStackClient() {
    if (!this._fileStackClient) {
      this._fileStackClient = init(FILE_STACK_API_KEY);
    }
    return this._fileStackClient;
  }

  zipRecentLogs = async (): Promise<[string, Blob] | null> => {
    const recentLogs = LogControlManager.instance().getRecentLogs();
    if (recentLogs.length < 1) {
      logger.debug('Recent logs is empty');
      return null;
    }
    const zipName = `LOG_${recentLogs[0].sessionId}.zip`;
    const contextInfo = await getAppContextInfo();
    const contextContent = Object.keys(contextInfo)
      .map(key => {
        return `${key}: ${contextInfo[key]}`;
      })
      .join('\n');
    const logContent = recentLogs
      .map((log, index: number) => {
        return `${index}: ${log.message}`;
      })
      .join('\n');
    // webworker
    const zip = new JSZip();
    zip.file('ContextInfo.txt', contextContent);
    zip.file('RecentLogs.txt', logContent);
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    return [zipName, zipBlob];
  }

  uploadRecentLogs = async (): Promise<UploadResult | null> => {
    const zipResult = await this.zipRecentLogs();
    if (!zipResult) {
      logger.debug('Zip log file fail.');
      return null;
    }
    const [zipName, zipBlob] = zipResult;
    return await this._getFileStackClient().upload(
      zipBlob,
      {
        onProgress: (evt: { totalPercent: number; totalBytes: number }) => {},
        timeout: 60 * 1000,
        retry: 1,
      },
      {
        filename: zipName,
      },
    );
  }
}

export { FeedbackService };
