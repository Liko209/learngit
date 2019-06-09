/*
 * @Author: Paynter Chen
 * @Date: 2019-03-29 10:48:59
 * Copyright © RingCentral. All rights reserved.
 */

import * as filestack from 'filestack-js';
import { FeedbackService } from '../FeedbackService';
import { LogControlManager } from 'sdk/service/uploadLogControl/LogControlManager';
import { getAppContextInfo } from '@/utils/error';
import * as Sentry from '@sentry/browser';
import { FeedbackApi } from '../../FeedbackApi';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { DateFormatter, SessionManager } from 'sdk';

jest.mock('@/utils/error');
jest.mock('../../FeedbackApi');
jest.mock('@sentry/browser');
jest.mock('sdk/service/uploadLogControl/LogControlManager', () => {
  const mockLogMng = {
    getZipLog: jest.fn().mockReturnValue([]),
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
  beforeAll(() => {
    const mockAccountService = ({
      userConfig: {
        getGlipUserId: jest.fn().mockReturnValue(1),
      },
    } as any) as AccountService;
    const mockSessionManager = ({
      getSession: jest.fn().mockReturnValue('MOCK_SESSION_ID'),
    } as any) as SessionManager;
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
    DateFormatter.formatDate = jest.fn().mockReturnValue('MOCK_TIME');
    SessionManager.getInstance = jest.fn().mockReturnValue(mockSessionManager);
  });
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
  describe('zipRecentLogs()', () => {
    it('should get [zipName, zipBlob]', async () => {
      const zipBlob = new Blob(['hi']);
      LogControlManager.instance().getZipLog.mockReturnValue(zipBlob);
      const feedbackService = new FeedbackService();
      const zipResult = await feedbackService.zipRecentLogs();
      expect(zipBlob).toEqual(zipResult.zipBlob);
    });
    it('should zip name format RC_LOG_{UID}_{SESSION_ID}_{CURRENT_TIME}.zip', async () => {
      DateFormatter.formatDate.mockReturnValue('MOCK_TIME');
      (SessionManager.getInstance().getSession as jest.Mock).mockReturnValue(
        'MOCK_SESSION_ID',
      );
      const zipBlob = new Blob(['hi']);
      LogControlManager.instance().getZipLog.mockReturnValue(zipBlob);
      const feedbackService = new FeedbackService();
      const zipResult = await feedbackService.zipRecentLogs();
      const { uid, sessionId, currentTime } = {
        uid: 1,
        sessionId: 'MOCK_SESSION_ID',
        currentTime: 'MOCK_TIME',
      };
      expect(`RC_LOG_${uid}_${sessionId}_${currentTime}.zip`).toEqual(
        zipResult.zipName,
      );
    });
  });
});
