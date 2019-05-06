/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-25 16:09:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RCWebSettingInfoController } from '../RCWebSettingInfoController';
import { RCInfoFetchController } from '../RCInfoFetchController';
import { RCAuthApi } from '../../../../api';
import { ERCWebSettingUri } from '../../types';
import { JobSchedulerConfig } from '../../../../framework/utils/jobSchedule/JobSchedulerConfig';

jest.mock('../../../../framework/utils/jobSchedule/JobSchedulerConfig', () => {
  const xx = {
    getLastSuccessTime: jest.fn(),
  };
  return {
    JobSchedulerConfig: () => {
      return xx;
    },
  };
});
jest.mock('../../../../api');
jest.mock('../RCInfoFetchController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

function makeUri(uri: string) {
  return uri.replace('{authCode}', 'codeeee');
}

const validClientData = {
  uri: 'http://api-glpdevxmn.lab.nordigy.ru/restapi/v1.0/client-info',
  client: {},
  provisioning: {
    interopClientIds: {
      serviceWeb:
        'DE0Af3c63a68092734D333990A0401D349EEd9bdc46e80ec158238C3D857A92A',
      expressSetup:
        'a85da13c1fd991f09A9EB97FB4301c1ebf9e3f840431877921151c06660858bf',
      liveReports: 'Z06yJnc8TMO92DVcUohrFg',
      qosReports: 'BG3JfKMgSUaSjZvEIT1KeA',
      analyticsPortal: 'YCzy6r9qTyCpyMPN1rUgVA',
    },
    webUris: {
      analyticsPortal:
        'https://analytics-glpdevxmn.ponylab.ringcentral.com?code={authCode}',
      privacyPolicy:
        'https://netstorage.ringcentral.com/legal/1210/en_US/privacypolicy.html',
      serviceWebBilling:
        'http://service-glpdevxmn.lab.nordigy.ru/login/main.asp?CDXB1210:11111&mid=400130658008&code={authCode}&enc=2&rdr=%2Fsettings%2Fbilling.html',
      serviceWebHome:
        'http://service-glpdevxmn.lab.nordigy.ru/login/main.asp?CDXB1210:2222&mid=400130658008&code={authCode}&enc=2&rdr=',
      serviceWebPhoneSystem:
        'http://service-glpdevxmn.lab.nordigy.ru/login/main.asp?CDXB1210:3333&mid=400130658008&code={authCode}&enc=2&rdr=/company/index.html',
      serviceWebUserPhones:
        'http://service-glpdevxmn.C3967B&mid=400130658008&code={authCode}&enc=2&rdr=%2Fsettings%2Findex.html%23%2Fsettings%2FphonesAndNumbers%2Fphone',
      serviceWebUserSettings:
        'http://service-glpdevxmn.lab.nordigy.ru/login/main.asp?CDXB1210:44444&mid=400130658008&code={authCode}',
      expiresIn: 1800,
    },
    hints: {},
  },
};

describe('RCWebSettingInfoController', () => {
  let webSettingInfoController: RCWebSettingInfoController;
  let rcInfoFetchController: RCInfoFetchController;
  let jobSchedulerConfig: JobSchedulerConfig;
  function setUp() {
    jobSchedulerConfig = new JobSchedulerConfig();
    rcInfoFetchController = new RCInfoFetchController();
    webSettingInfoController = new RCWebSettingInfoController(
      rcInfoFetchController,
    );
    rcInfoFetchController.requestRCClientInfo = jest.fn();
    rcInfoFetchController.getRCClientInfo = jest.fn();
    RCAuthApi.generateRCCode = jest.fn();
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('generateRCAuthCodeUri', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should throw error when there is an error when generating auth code from server', async () => {
      const error = new Error();
      rcInfoFetchController.getRCClientInfo = jest
        .fn()
        .mockResolvedValue(validClientData);
      RCAuthApi.generateRCCode = jest.fn().mockRejectedValueOnce(error);
      const res = webSettingInfoController.generateRCAuthCodeUri(
        ERCWebSettingUri.EXTENSION_URI,
      );

      expect(res).rejects.toThrowError(error);
    });

    it('should return empty string when client info', async () => {
      rcInfoFetchController.getRCClientInfo = jest
        .fn()
        .mockResolvedValue(undefined);

      const res = webSettingInfoController.generateRCAuthCodeUri(
        ERCWebSettingUri.EXTENSION_URI,
      );

      expect(res).resolves.toEqual('');
    });

    it('should return empty string when no client id', async () => {
      const data = _.cloneDeep(validClientData);
      data.provisioning['interopClientIds'] = {} as any;
      rcInfoFetchController.getRCClientInfo = jest.fn().mockResolvedValue(data);

      const res = webSettingInfoController.generateRCAuthCodeUri(
        ERCWebSettingUri.EXTENSION_URI,
      );

      expect(res).resolves.toEqual('');
    });

    it('should return empty string when no redirect uri', async () => {
      const data = _.cloneDeep(validClientData);
      data.provisioning['webUris'] = {} as any;
      rcInfoFetchController.getRCClientInfo = jest.fn().mockResolvedValue(data);

      const res = await webSettingInfoController.generateRCAuthCodeUri(
        ERCWebSettingUri.EXTENSION_URI,
      );

      expect(res).toEqual('');
    });

    it('should request latest client info when web uri in client info expired', async () => {
      const data = _.cloneDeep(validClientData);
      jobSchedulerConfig.getLastSuccessTime = jest.fn().mockReturnValue(0);

      rcInfoFetchController.getRCClientInfo = jest
        .fn()
        .mockResolvedValueOnce(data)
        .mockResolvedValueOnce(validClientData);
      rcInfoFetchController.requestRCClientInfo = jest.fn();
      RCAuthApi.generateRCCode = jest
        .fn()
        .mockResolvedValue({ code: 'codeeee' });

      const res = await webSettingInfoController.generateRCAuthCodeUri(
        ERCWebSettingUri.EXTENSION_URI,
      );

      expect(rcInfoFetchController.requestRCClientInfo).toBeCalled();
      expect(res).toEqual(
        'http://service-glpdevxmn.lab.nordigy.ru/login/main.asp?CDXB1210:44444&mid=400130658008&code=codeeee',
      );
    });

    const res = [
      makeUri(validClientData.provisioning.webUris.analyticsPortal),
      makeUri(validClientData.provisioning.webUris.serviceWebBilling),
      makeUri(validClientData.provisioning.webUris.serviceWebUserSettings),
      makeUri(validClientData.provisioning.webUris.serviceWebPhoneSystem),
    ];

    const clientIds = [
      validClientData.provisioning.interopClientIds.analyticsPortal,
      validClientData.provisioning.interopClientIds.serviceWeb,
    ];
    it.each`
      data               | type                                    | result    | clientId        | comments
      ${validClientData} | ${ERCWebSettingUri.ANALYTIC_PORTAL_URI} | ${res[0]} | ${clientIds[0]} | ${'ANALYTIC_PORTAL_URI'}
      ${validClientData} | ${ERCWebSettingUri.BILLING_URI}         | ${res[1]} | ${clientIds[1]} | ${'BILLING_URI'}
      ${validClientData} | ${ERCWebSettingUri.EXTENSION_URI}       | ${res[2]} | ${clientIds[1]} | ${'EXTENSION_URI'}
      ${validClientData} | ${ERCWebSettingUri.PHONE_SYSTEM_URI}    | ${res[3]} | ${clientIds[1]} | ${'PHONE_SYSTEM_URI'}
    `('$comments', async ({ data, type, clientId, result }) => {
      rcInfoFetchController.getRCClientInfo = jest.fn().mockResolvedValue(data);
      RCAuthApi.generateRCCode = jest
        .fn()
        .mockResolvedValue({ code: 'codeeee' });
      const res = await webSettingInfoController.generateRCAuthCodeUri(type);
      expect(RCAuthApi.generateRCCode).toBeCalledWith(clientId, 300);
      expect(res).toEqual(result);
    });
  });
});
