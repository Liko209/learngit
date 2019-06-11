/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-09 20:00:42
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { AllCallsDataProvider } from '../AllCallsDataProvider';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { QUERY_DIRECTION } from 'sdk/dao';
import { Notification } from '@/containers/Notification';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { CALL_LOG_SOURCE } from 'sdk/module/RCItems/callLog/constants';

import { CallLogType } from '../types';

jest.mock('@/containers/Notification');

const checkNotification = (message: string) => ({
  message,
  autoHideDuration: 3000,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'error',
});

describe('VoicemailDataProvider', () => {
  const calllogService = {
    name: ServiceConfig.CALL_LOG_SERVICE,
    fetchCallLogs() {},
  };

  @testable
  class fetchData {
    @test(
      'should be call fetchVoicemails not anchor when use fetchData [JPT-2145]',
    )
    @mockService(calllogService, 'fetchCallLogs', true)
    async t1() {
      const dataProvider = new AllCallsDataProvider(CallLogType.All);
      const ret = await dataProvider.fetchData(QUERY_DIRECTION.OLDER, 1);
      expect(calllogService.fetchCallLogs).toHaveBeenCalledWith(
        CALL_LOG_SOURCE.ALL,
        undefined,
        1,
        QUERY_DIRECTION.NEWER,
      );
      expect(ret).toBeTruthy();
    }

    @test(
      'should be call fetchVoicemails with anchor when use fetchData [JPT-2145]',
    )
    @mockService(calllogService, 'fetchCallLogs', true)
    async t2() {
      const dataProvider = new AllCallsDataProvider(CallLogType.MissedCall);
      const ret = await dataProvider.fetchData(QUERY_DIRECTION.NEWER, 1, {
        id: '1',
        sortValue: 1,
      });
      expect(calllogService.fetchCallLogs).toHaveBeenCalledWith(
        CALL_LOG_SOURCE.MISSED,
        '1',
        1,
        QUERY_DIRECTION.OLDER,
      );
      expect(ret).toBeTruthy();
    }

    @test(
      'should toast error message when fetch data failed due to network error [JPT-2161]',
    )
    @mockService(calllogService, 'fetchCallLogs', () => {
      throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    })
    async t3() {
      const dataProvider = new AllCallsDataProvider();
      await dataProvider.fetchData(QUERY_DIRECTION.OLDER, 1, {
        id: '1',
        sortValue: 1,
      });
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToLoadCallLogsForNetworkIssue'),
      );
    }

    @test(
      'should toast error message when fetch data failed due to server error [JPT-2162]',
    )
    @mockService(calllogService, 'fetchCallLogs', () => {
      throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    })
    async t4() {
      const dataProvider = new AllCallsDataProvider();
      await dataProvider.fetchData(QUERY_DIRECTION.OLDER, 1, {
        id: '1',
        sortValue: 1,
      });
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToLoadCallLogsForServerIssue'),
      );
    }
  }
});
