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
import * as Sentry from '@sentry/browser';
import { FeedbackApi } from '../FeedbackApi';

enum ZIP_LEVEL {
  LOW = 3,
  MIDDLE = 6,
  HEIGH = 9,
}
type UploadOption = { timeout: number; retry: number };

const DEFAULT_OPTION: UploadOption = {
  retry: 2,
  timeout: 60 * 1000,
};

class FeedbackService {
  private _fileStackClient: ReturnType<typeof init>;

  private _getFileStackClient() {
    if (!this._fileStackClient) {
      this._fileStackClient = init(FILE_STACK_API_KEY);
    }
    return this._fileStackClient;
  }

  zipRecentLogs = async (level?: ZIP_LEVEL): Promise<[string, Blob] | null> => {
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
        level: level || ZIP_LEVEL.HEIGH,
      },
    });
    return [zipName, zipBlob];
  }

  uploadRecentLogs = async (
    option?: Partial<UploadOption>,
  ): Promise<UploadResult | null> => {
    const { retry = DEFAULT_OPTION.retry, timeout = DEFAULT_OPTION.timeout } =
      option || DEFAULT_OPTION;
    const zipResult = await this.zipRecentLogs();
    if (!zipResult) {
      logger.debug('Zip log file fail.');
      return null;
    }
    const [zipName, zipBlob] = zipResult;
    return await this._getFileStackClient().upload(
      zipBlob,
      {
        timeout,
        retry,
        onProgress: (evt: { totalPercent: number; totalBytes: number }) => {},
      },
      {
        filename: zipName,
      },
    );
  }

  sendFeedback = async (
    message: string,
    comments: string,
  ): Promise<void> => {
    if (!Sentry.getCurrentHub().getClient()) {
      throw 'Sentry is not init.';
    }
    const appContextInfo = await getAppContextInfo();
    const eventId = Sentry.captureMessage(`[Feedback] ${message}`);
    await FeedbackApi.sendFeedback({
      comments,
      event_id: eventId,
      email: appContextInfo.email,
      name: appContextInfo.username,
    });
  }
}

export { FeedbackService };
