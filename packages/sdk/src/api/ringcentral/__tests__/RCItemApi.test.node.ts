/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 19:31:21
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemApi } from '../RCItemApi';
import {
  NETWORK_VIA,
  REQUEST_HEADER_KEYS,
  CONTENT_TYPES,
} from 'foundation/network';
import { CallLogSyncParams, RCMessageSyncParams } from '../types/RCItemSync';
import { SYNC_TYPE } from 'sdk/module/RCItems/sync';
import { READ_STATUS } from 'sdk/module/RCItems/constants';

jest.mock('../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCItemApi', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('deleteCallLog()', () => {
    it('should be called with correct params', () => {
      RCItemApi.deleteCallLog(['qwe', 'asd']);
      expect(RCItemApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/call-log/qwe,asd',
        method: 'delete',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('syncCallLog()', () => {
    it('should be called with correct params', () => {
      const params: CallLogSyncParams = {
        syncType: SYNC_TYPE.FSYNC,
      };
      RCItemApi.syncCallLog(params);
      expect(RCItemApi.rcNetworkClient.get).toHaveBeenCalledWith({
        params,
        path: '/v1.0/account/~/extension/~/call-log-sync',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('deleteMessage()', () => {
    it('should be called with correct params', () => {
      RCItemApi.deleteMessage([123, 456]);
      expect(RCItemApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/message-store/123,456',
        method: 'delete',
        authFree: false,
        via: NETWORK_VIA.HTTP,
      });
    });
  });

  describe('deleteAllMessages()', () => {
    it('should be called with correct params', () => {
      RCItemApi.deleteAllMessages({
        dateTo: '123',
        type: 'type',
      } as any);
      expect(RCItemApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/message-store',
        method: 'delete',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: {
          dateTo: '123',
          type: 'type',
        },
      });
    });
  });

  describe('syncMessage()', () => {
    it('should be called with correct params', () => {
      const params: RCMessageSyncParams = {
        syncType: SYNC_TYPE.FSYNC,
      };
      RCItemApi.syncMessage(params);
      expect(RCItemApi.rcNetworkClient.get).toHaveBeenCalledWith({
        params,
        path: '/v1.0/account/~/extension/~/message-sync',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        method: 'get',
      });
    });
  });

  describe('updateMessageReadStatus', () => {
    it('should be called with correct params', () => {
      RCItemApi.updateMessageReadStatus(111, READ_STATUS.READ);
      expect(RCItemApi.rcNetworkClient.http).toHaveBeenCalledWith({
        data: { readStatus: 'Read' },
        path: `/v1.0/account/~/extension/~/message-store/111`,
        method: 'put',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        headers: { [REQUEST_HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON },
      });
    });
  });
});
