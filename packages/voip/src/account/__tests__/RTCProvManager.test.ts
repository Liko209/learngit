/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:30:22
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RTCProvManager } from '../RTCProvManager';
import { rtcRestApiManager } from '../../utils/RTCRestApiManager';
import {
  kRTCProvParamsErrorRertyTimer,
  kRTCProvRequestErrorRertyTimerMax,
  kRTCProvRequestErrorRertyTimerMin,
} from '../constants';

describe('RTCProvManager', async () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockProvData_normal = {
    device: {},
    sipInfo: {
      transport: '123',
      password: '123',
      domain: '123',
      username: '123',
      authorizationId: '123',
      outboundProxy: '123',
    },
    sipFlags: {},
  };

  const mockProvResponse_normal = {
    data: mockProvData_normal,
    status: 200,
    retryAfter: 0,
  };

  describe('acquireSipProv()', async () => {
    it('should do nothing when it is in retry timer', async () => {
      const pm = new RTCProvManager();
      pm._canAcquireSipProv = false;
      jest.spyOn(pm, '_sendSipProvRequest');
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
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
        .spyOn(rtcRestApiManager, 'sendRequest')
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
        .spyOn(rtcRestApiManager, 'sendRequest')
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
        .spyOn(rtcRestApiManager, 'sendRequest')
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
        .spyOn(rtcRestApiManager, 'sendRequest')
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
      mockProvResponse_unnormal.data.sipInfo.transport = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
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
      mockProvResponse_unnormal.data.sipInfo.transport = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_clearFreshTimer');
      await pm.acquireSipProv();
      expect(pm.retrySeconds).toBe(7300);
      expect(pm._clearFreshTimer).toBeCalled();
    });

    it('should Do nothing when same sip provision is returned JPT-659', async () => {
      const pm = new RTCProvManager();
      jest.spyOn(pm, 'emit');
      jest.spyOn(pm, '_resetFreshTimer');
      pm._sipProvisionInfo = _.cloneDeep(mockProvData_normal);
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
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
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      await pm.acquireSipProv();
      await pm.acquireSipProv();
      expect(pm._sendSipProvRequest).toBeCalledTimes(1);
    });

    it('should do nothing when acquire provision again after previous request is invalid JPT-724', async () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.transport = '';
      jest.spyOn(pm, '_sendSipProvRequest');
      jest.spyOn(rtcRestApiManager, 'sendRequest');
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      await pm.acquireSipProv();
      await pm.acquireSipProv();
      expect(pm._sendSipProvRequest).toBeCalledTimes(1);
    });
  });

  describe('_checkSipProvInfoParame()', async () => {
    it('should The provision response be invalid when Transport filed is missed JPT-634', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo.transport;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Transport value is null JPT-647', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.transport = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Password filed is missed JPT-636', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo.password;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Password value is null JPT-648', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.password = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Domain filed is missed JPT-637', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo.domain;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Domain value is null JPT-649', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.domain = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Username filed is missed JPT-638', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo.username;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Username value is null JPT-650', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.username = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Authorization filed is missed JPT-640', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo.authorizationId;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Authorization value is null JPT-651', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.authorizationId = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when OutboundProxy filed is missed JPT-641', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.sipInfo.outboundProxy;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when OutboundProxy value is null JPT-652', async () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = _.cloneDeep(mockProvResponse_normal);
      mockProvResponse_unnormal.data.sipInfo.outboundProxy = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      await pm.acquireSipProv();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });
  });
});
