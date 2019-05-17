/*
 * @Author: Paynter Chen
 * @Date: 2019-03-29 10:48:59
 * Copyright © RingCentral. All rights reserved.
 */

import * as filestack from 'filestack-js';
import { FeedbackService } from '../FeedbackService';
import { LogControlManager } from 'sdk/src/service/uploadLogControl/LogControlManager';
import { getAppContextInfo } from '@/utils/error';
import * as Sentry from '@sentry/browser';
import { FeedbackApi } from '../../FeedbackApi';
jest.mock('@/utils/error');
jest.mock('../../FeedbackApi');
jest.mock('@sentry/browser');
jest.mock('sdk/service/uploadLogControl/LogControlManager', () => {
  const mockLogMng = {
    getZipLog: jest.fn(),
  };
  const mock = {
    instance: () => mockLogMng,
  };
  return {
    LogControlManager: mock,
  };
});
jest.mock('filestack-js', () => {
  const mockClient = {
    upload: jest.fn(),
  };
  const mock = {
    init: () => mockClient,
  };
  return mock;
});
jest.mock('jszip', () => {
  const mock = {
    file: jest.fn(),
    generateAsync: jest.fn().mockImplementation(() => {}),
  };
  return () => mock;
});

describe('FeedbackService', () => {
  describe('uploadRecentLogs()', () => {
    it('should zip logs', async () => {
      const feedbackService = new FeedbackService();
      getAppContextInfo.mockReturnValue({});
      const filestackClient = filestack.init('');
      const logControlManager = LogControlManager.instance();
      logControlManager.getZipLog.mockReturnValue(new Blob());
      await feedbackService.uploadRecentLogs();
      expect(filestackClient.upload).toBeCalled();
    });
  });
  describe('sendFeedback()', () => {
    it('should call Feedback api', async () => {
      const feedbackService = new FeedbackService();
      (Sentry.getCurrentHub as jest.Mock).mockReturnValue({
        getClient: () => true,
      });
      (Sentry.captureMessage as jest.Mock).mockReturnValue('id');
      getAppContextInfo.mockReturnValue({
        email: 'email',
        username: 'username',
      });
      await feedbackService.sendFeedback('message', 'comments');
      expect(FeedbackApi.sendFeedback).toBeCalledWith({
        comments: 'comments',
        event_id: 'id',
        email: 'email',
        name: 'username',
      });
    });
  });
});
