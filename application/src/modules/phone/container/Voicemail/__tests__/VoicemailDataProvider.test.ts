/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 18:28:57
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { VoicemailDataProvider } from '../VoicemailDataProvider';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { QUERY_DIRECTION } from 'sdk/dao';
import { Notification } from '@/containers/Notification';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';

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
  const voicemailService = {
    name: ServiceConfig.VOICEMAIL_SERVICE,
    fetchVoicemails() {},
  };

  @testable
  class fetchData {
    @test('should be call fetchVoicemails not anchor when use fetchData')
    @mockService(voicemailService, 'fetchVoicemails', true)
    async t1() {
      const dataProvider = new VoicemailDataProvider();
      const ret = await dataProvider.fetchData(QUERY_DIRECTION.OLDER, 1);
      expect(voicemailService.fetchVoicemails).toHaveBeenCalledWith(
        1,
        QUERY_DIRECTION.NEWER,
        undefined,
      );
      expect(ret).toBeTruthy();
    }

    @test('should be call fetchVoicemails with anchor when use fetchData')
    @mockService(voicemailService, 'fetchVoicemails', true)
    async t2() {
      const dataProvider = new VoicemailDataProvider();
      const ret = await dataProvider.fetchData(QUERY_DIRECTION.NEWER, 1, {
        id: 1,
        sortValue: 1,
      });
      expect(voicemailService.fetchVoicemails).toHaveBeenCalledWith(
        1,
        QUERY_DIRECTION.OLDER,
        1,
      );
      expect(ret).toBeTruthy();
    }

    @test(
      'should toast error message when fetch data failed due to network error [JPT-2135]',
    )
    @mockService(voicemailService, 'fetchVoicemails', () => {
      throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    })
    async t3() {
      const dataProvider = new VoicemailDataProvider();
      await dataProvider.fetchData(QUERY_DIRECTION.OLDER, 1, {
        id: 1,
        sortValue: 1,
      });
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification(
          'phone.prompt.notAbleToLoadVoicemailsForNetworkIssue',
        ),
      );
    }

    @test(
      'should toast error message when fetch data failed due to server error [JPT-2136]',
    )
    @mockService(voicemailService, 'fetchVoicemails', () => {
      throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    })
    async t4() {
      const dataProvider = new VoicemailDataProvider();
      await dataProvider.fetchData(QUERY_DIRECTION.OLDER, 1, {
        id: 1,
        sortValue: 1,
      });
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToLoadVoicemailsForServerIssue'),
      );
    }
  }
});
