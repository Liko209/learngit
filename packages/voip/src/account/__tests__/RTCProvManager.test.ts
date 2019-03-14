/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:30:22
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RTCProvManager } from '../RTCProvManager';
import { RTCRestApiManager } from '../../utils/RTCRestApiManager';
import {
  kRTCProvParamsErrorRertyTimer,
  kRTCProvRequestErrorRertyTimerMax,
  kRTCProvRequestErrorRertyTimerMin,
} from '../constants';
import { RTCDaoManager } from '../../utils/RTCDaoManager';
import { ITelephonyDaoDelegate } from 'foundation';
import { RTCSipProvisionInfo } from '../types';

describe('RTCProvManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockProvData_normal = {
    device: {},
    sipInfo: [
      {
        transport: '123',
        password: '123',
        domain: '123',
        username: '123',
        authorizationId: '123',
        outboundProxy: '123',
      },
    ],
    sipFlags: {},
  };

  const mockProvResponse_normal = {
    data: mockProvData_normal,
    status: 200,
    retryAfter: 0,
  };

  class MockLocalStorage implements ITelephonyDaoDelegate {
    public prov: RTCSipProvisionInfo | null = null;

    put(key: string, value: any): void {
      this.prov = value;
    }
    get(key: string) {
      return this.prov;
    }
    remove(key: string): void {
      this.prov = null;
    }
  }

  describe('save / read provisioning from local storage', () => {
    let provManager: RTCProvManager;
    let localStorage: MockLocalStorage;
    function setupMockLocalStorage() {
      provManager = new RTCProvManager();
      localStorage = new MockLocalStorage();
      RTCDaoManager.instance().setDaoDelegate(localStorage);
      localStorage.remove('sip-info');
    }
    it('should send provisioning request and return local provisioning info when local provisioning info exist after call acquireSipProv. [JPT-1005]', async () => {
      setupMockLocalStorage();
      localStorage.put('sip-info', mockProvData_normal);
      jest.spyOn(provManager, '_sendSipProvRequest');
      jest.spyOn(provManager, 'emit');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(null);
      await provManager.acquireSipProv();
      expect(provManager.emit).toBeCalled();
      expect(provManager._sendSipProvRequest).toBeCalled();
    });

    it('should send provisioning request when local provisioning info is NOT exists after call aquireSipProv. [JPT-1006]', async () => {
      setupMockLocalStorage();
      jest.spyOn(provManager, '_sendSipProvRequest');
      jest.spyOn(provManager, 'emit');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(null);
      await provManager.acquireSipProv();
      localStorage.remove('sip-info');
      expect(provManager.emit).not.toBeCalled();
      expect(provManager._sendSipProvRequest).toBeCalled();
    });

    it('should do nothing if new returned provisioning info is same as current provisioning info. [ JPT-1007]', async () => {
      setupMockLocalStorage();
      localStorage.put('sip-info', mockProvResponse_normal);
      jest.spyOn(provManager, '_sendSipProvRequest');
      jest.spyOn(provManager, 'emit');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvData_normal);
      await provManager.acquireSipProv();
      expect(provManager.emit).toBeCalledTimes(1);
      expect(provManager._sendSipProvRequest).toBeCalled();
    });

    it('should update provisioning info in local storage and current memory when new returned provisioning info is different. [JPT-1008]', async () => {
      setupMockLocalStorage();
      const newProveResponse = mockProvResponse_normal;
      newProveResponse.data.sipInfo[0].username = '345';
      localStorage.put('sip-info', mockProvResponse_normal);
      jest.spyOn(provManager, '_sendSipProvRequest');
      jest.spyOn(provManager, 'emit');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(newProveResponse);
      await provManager.acquireSipProv();
      expect(provManager.emit).toBeCalledTimes(2);
      expect(provManager._sendSipProvRequest).toBeCalled();
      const newLocalProvInfo = localStorage.get('sip-info');
      expect(newLocalProvInfo.sipInfo[0].username).toBe('345');
      expect(provManager._sipProvisionInfo.sipInfo[0].username).toBe('345');
    });
  });

  describe('acquireSipProv()', () => {
    it('should do nothing when it is in retry timer', async () => {
      const pm = new RTCProvManager();
      pm._canAcquireSipProv = false;
      jest.spyOn(pm, '_sendSipProvRequest');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      await pm.acquireSipProv();
      expect(pm._sendSipProvRequest).not.toBeCalled();
    });

    it('should Emit NewProvision , reset 24h and error retry timers after validating the provision api response successfully(has provision before) JPT-729', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_another = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_another.data.sipInfo.transport = '456';
      pm._sipProvisionInfo = mockProvResponse_another;
      jest.spyOn(pm, 'emit');
      jest.spyOn(pm, '_resetFreshTimer');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      await pm.acquireSipProv();
      expect(pm.emit).toBeCalled();
      expect(pm._resetFreshTimer).toBeCalled();
      expect(pm._requestErrorRetryInterval).toBe(
        kRTCProvRequestErrorRertyTimerMin,
      );
    });

    it('should Emit NewProvision , reset 24h and error retry timers after validating the provision api response successfully(not has provision before) JPT-632', async () => {
      const pm = new RTCProvManager();
      jest.spyOn(pm, 'emit');
      jest.spyOn(pm, '_resetFreshTimer');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      await pm.acquireSipProv();
      expect(pm.emit).toBeCalled();
      expect(pm._resetFreshTimer).toBeCalled();
      expect(pm._requestErrorRetryInterval).toBe(
        kRTCProvRequestErrorRertyTimerMin,
      );
    });

    it('should Retry request provision at kRTCProvRequestErrorRertyTimerMin,16,32...3600s(retryAfter < kRTCProvRequestErrorRertyTimerMin)  interval when request sip provision failed JPT-633', async () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.status = 400;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_clearFreshTimer');
      await pm.acquireSipProv();
      for (
        let i = kRTCProvRequestErrorRertyTimerMin;
        i <= kRTCProvRequestErrorRertyTimerMax;
        i = i * 2
      ) {
        await setImmediate(() => {});
        const interval = Math.min(i, kRTCProvRequestErrorRertyTimerMax);
        expect(pm.retrySeconds).toBe(interval);
        jest.advanceTimersByTime(interval * 1000);
      }
      expect(pm._clearFreshTimer).toBeCalled();
    });

    it('should Retry request provision at max(kRTCProvRequestErrorRertyTimerMin,16,32...3600s,retryAfter)(retryAfter > kRTCProvRequestErrorRertyTimerMin)  interval when request sip provision failed ', async () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.status = 400;
      mockProvResponse_unnormal.retryAfter = 2000;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_clearFreshTimer');
      await pm.acquireSipProv();
      for (
        let i = kRTCProvRequestErrorRertyTimerMin;
        i <= kRTCProvRequestErrorRertyTimerMax;
        i = i * 2
      ) {
        await setImmediate(() => {});
        const interval = Math.max(
          Math.min(i, kRTCProvRequestErrorRertyTimerMax),
          2000,
        );
        expect(pm.retrySeconds).toBe(interval);
        jest.advanceTimersByTime(interval * 1000);
      }
      expect(pm._clearFreshTimer).toBeCalled();
    });

    it('should Retry request provision at 2h interval(retryAfter < 2h) when response is invalid JPT-658', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].transport = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_clearFreshTimer');
      await pm.acquireSipProv();
      expect(pm.retrySeconds).toBe(kRTCProvParamsErrorRertyTimer);
      expect(pm._clearFreshTimer).toBeCalled();
    });

    it('should Retry request provision at retryAfter interval(retryAfter > 2h) when response is invalid', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.retryAfter = 7300;
      mockProvResponse_unnormal.data.sipInfo[0].transport = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_clearFreshTimer');
      await pm.acquireSipProv();
      expect(pm.retrySeconds).toBe(7300);
      expect(pm._clearFreshTimer).toBeCalled();
    });

    it('should do nothing when same sip provision is returned JPT-659', async () => {
      RTCDaoManager.instance().setDaoDelegate(null);
      const pm = new RTCProvManager();
      jest.spyOn(pm, 'emit');
      jest.spyOn(pm, '_resetFreshTimer');
      pm._sipProvisionInfo = _.cloneDeep(mockProvData_normal);
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      await pm.acquireSipProv();
      expect(pm.emit).not.toBeCalled();
      expect(pm._resetFreshTimer).toBeCalled();
      expect(pm._requestErrorRetryInterval).toBe(
        kRTCProvRequestErrorRertyTimerMin,
      );
    });

    it('should do nothing when acquire provision again after previous request failed JPT-723', async () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.status = 400;
      jest.spyOn(pm, '_sendSipProvRequest');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      await pm.acquireSipProv();
      await pm.acquireSipProv();
      expect(pm._sendSipProvRequest).toBeCalledTimes(1);
    });

    it('should do nothing when acquire provision again after previous request is invalid JPT-724', async () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].transport = '';
      jest.spyOn(pm, '_sendSipProvRequest');
      jest.spyOn(RTCRestApiManager.instance(), 'sendRequest');
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      await pm.acquireSipProv();
      await pm.acquireSipProv();
      expect(pm._sendSipProvRequest).toBeCalledTimes(1);
    });
  });

  describe('_checkSipProvInfoParams()', () => {
    it('should The provision response be invalid when Transport filed is missed JPT-634', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo[0].transport;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Transport value is null JPT-647', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].transport = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Password filed is missed JPT-636', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo[0].password;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Password value is null JPT-648', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].password = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Domain filed is missed JPT-637', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo[0].domain;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Domain value is null JPT-649', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].domain = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Username filed is missed JPT-638', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo[0].username;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Username value is null JPT-650', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].username = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Authorization filed is missed JPT-640', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo[0].authorizationId;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Authorization value is null JPT-651', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].authorizationId = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when OutboundProxy filed is missed JPT-641', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo[0].outboundProxy;
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });

    it('should The provision response be invalid when OutboundProxy value is null JPT-652', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo[0].outboundProxy = '';
      jest
        .spyOn(RTCRestApiManager.instance(), 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParams');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParams).lastReturnedWith(false);
    });
  });
});
