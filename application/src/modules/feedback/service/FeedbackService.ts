/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */

import { init } from 'filestack-js';
import { logger } from '../utils';
import { LogControlManager } from 'sdk/service/uploadLogControl/LogControlManager';
import { FILE_STACK_API_KEY } from '../constants';
import { UploadResult } from '../types';
import { getAppContextInfo } from '@/utils/error';
import * as Sentry from '@sentry/browser';
import { FeedbackApi } from '../FeedbackApi';
import { SessionManager, DateFormatter } from 'sdk';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { ZipItemLevel } from 'sdk/service/uploadLogControl/types';

type UploadOption = { timeout: number; retry: number; level: ZipItemLevel };

const DEFAULT_OPTION: UploadOption = {
  retry: 2,
  timeout: 60 * 1000,
  level: ZipItemLevel.NORMAL,
};

class FeedbackService {
  private _fileStackClient: ReturnType<typeof init>;

  private _getFileStackClient() {
    if (!this._fileStackClient) {
      this._fileStackClient = init(FILE_STACK_API_KEY);
    }
    return this._fileStackClient;
  }

  zipRecentLogs = async (
    level?: ZipItemLevel,
  ): Promise<{ zipName: string; zipBlob: Blob }> => {
    const zipBlob = await LogControlManager.instance().getZipLog(level);
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    const uid = accountService.userConfig.getGlipUserId();
    const sessionId = SessionManager.getInstance().getSession();
    return {
      zipBlob,
      zipName: `RC_LOG_${uid}_${sessionId}_${DateFormatter.formatDate()}.zip`,
    };
  };

  uploadRecentLogs = async (
    option?: Partial<UploadOption>,
  ): Promise<UploadResult | null> => {
    const {
      retry = DEFAULT_OPTION.retry,
      timeout = DEFAULT_OPTION.timeout,
      level,
    } = { ...DEFAULT_OPTION, ...option };
    const zipResult = await this.zipRecentLogs(level);
    if (!zipResult) {
      logger.debug('Zip log file fail.');
      return null;
    }
    const { zipName, zipBlob } = zipResult;
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
  };

  sendFeedback = async (message: string, comments: string): Promise<void> => {
    /* eslint-disable  no-throw-literal */
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
  };
}

export { FeedbackService };
