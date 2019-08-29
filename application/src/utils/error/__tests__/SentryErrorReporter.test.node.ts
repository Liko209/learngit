/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 16:23:34
 * Copyright © RingCentral. All rights reserved.
 */
import * as Sentry from '@sentry/browser';
import { SentryErrorReporter } from '../SentryErrorReporter';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PermissionService } from 'sdk/module/permission';

jest.mock('sdk/module/permission');

jest.mock('@sentry/browser', () => {
  const mock = {
    init: jest.fn(),
    configureScope: jest.fn(),
    captureException: jest.fn(),
  };
  return mock;
});
describe('SentryErrorReporter', () => {
  let permissionService: PermissionService;
  beforeEach(() => {
    permissionService = new PermissionService();
    ServiceLoader.getInstance = jest.fn().mockImplementation(config => {
      if (config === ServiceConfig.PERMISSION_SERVICE) {
        return permissionService;
      }
    });
  });
  describe('init()', () => {
    it('should config Sentry', async () => {
      const errorReporter = new SentryErrorReporter();
      await errorReporter.init();
      expect(Sentry.init).toHaveBeenCalled();
    });
  });
  describe('report()', () => {
    it('should call Sentry.captureException()', async () => {
      const errorReporter = new SentryErrorReporter();
      await errorReporter.init();
      const mockError = new Error('dddd');
      errorReporter.report(mockError);
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    });
  });
  describe('setUser()', () => {
    it('should call Sentry.setUserContext()', async () => {
      const errorReporter = new SentryErrorReporter();
      const mockContextInfo = {
        id: 111,
        username: 'mm',
        companyId: 333,
        email: 'xx',
        env: 'xm-up',
        version: '1.0.0',
      };
      await errorReporter.setUserContextInfo(mockContextInfo);
      expect(Sentry.configureScope).toHaveBeenCalled();
    });
  });
  describe('beforeSend()', () => {
    const message =
      "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.";
    const tag = {
      version: '1.7.0',
      env: 'production',
    };
    const event = {
      exception: {
        values: [
          {
            value: message,
          },
        ],
      },
      tags: { ...tag, os: 'mac', browser: 'Electron' },
    };
    it('should return null when event match errorFilter', async () => {
      const errorFilter = [
        {
          messages: [message],
          tags: tag,
        },
      ];
      permissionService.getFeatureFlag = jest
        .fn()
        .mockResolvedValue(errorFilter);
      const errorReporter = new SentryErrorReporter();
      const result = await errorReporter.beforeSend(event);
      expect(result).toBeNull();
    });

    it('should return null when event message match errorFilter', async () => {
      const errorFilter = [
        {
          messages: ["Failed to execute 'transaction' on 'IDBDatabase"],
          tags: tag,
        },
      ];
      permissionService.getFeatureFlag = jest
        .fn()
        .mockResolvedValue(errorFilter);
      const errorReporter = new SentryErrorReporter();
      const result = await errorReporter.beforeSend(event);
      expect(result).toBeNull();
    });
    it('should return event when errorFilter is empty', async () => {
      const errorFilter = [];
      permissionService.getFeatureFlag = jest
        .fn()
        .mockResolvedValue(errorFilter);
      const errorReporter = new SentryErrorReporter();
      const result = await errorReporter.beforeSend(event);
      expect(result).toEqual(event);
    });

    it('should return event when event not match errorFilter', async () => {
      const errorFilter = [
        {
          messages: ['1', '2', '3'],
          tags: tag,
        },
      ];
      permissionService.getFeatureFlag = jest
        .fn()
        .mockResolvedValue(errorFilter);
      const errorReporter = new SentryErrorReporter();
      const result = await errorReporter.beforeSend(event);
      expect(result).toEqual(event);
    });
  });
});
