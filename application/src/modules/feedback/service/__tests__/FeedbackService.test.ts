/*
 * @Author: Paynter Chen
 * @Date: 2019-03-29 10:48:59
 * Copyright © RingCentral. All rights reserved.
 */

import * as filestack from 'filestack-js';
import JSZip from 'jszip';
import { FeedbackService } from '../FeedbackService';
import { LogControlManager } from 'sdk/service/uploadLogControl/logControlManager';
import { getAppContextInfo } from '@/utils/error';
jest.mock('@/utils/error');
jest.mock('sdk/service/uploadLogControl/logControlManager', () => {
  const mockLogMng = {
    getRecentLogs: jest.fn(),
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
      const jsZip = new JSZip();
      const filestackClient = filestack.init('');
      const logControlManager = LogControlManager.instance();
      logControlManager.getRecentLogs.mockReturnValue([
        { log: { message: 'tee' } },
      ]);
      await feedbackService.uploadRecentLogs();
      expect(jsZip.file).toBeCalled();
      expect(jsZip.generateAsync).toBeCalled();
      expect(filestackClient.upload).toBeCalled();
    });
  });
});
