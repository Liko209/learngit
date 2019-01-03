/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:30:22
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCProvManager } from '../RTCProvManager';
import { rtcRestApiManager } from '../RTCRestApiManager';

describe('RTCProvManager', async () => {
  const mockProvData_normal = {
    sipFlags: {},
    device: {
      transport: '123',
      password: '123',
      domain: '123',
      username: '123',
      authorizationID: '123',
      outboundProxy: '123',
    },
    sipInfo: {},
  };

  const mockProvResponse_normal = {
    data: mockProvData_normal,
    status: 200,
    retryAfter: 0,
  };

  describe('doSipProvRequest()', () => {
    it('should do nothing when it is in retry timer', () => {
      const pm = new RTCProvManager();
      pm._isInErrorRetryTimer = true;
      jest.spyOn(rtcRestApiManager, 'sendRequest');
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      pm.doSipProvRequest();
      expect(rtcRestApiManager.sendRequest).not.toBeCalled();
    });

    it('should Emit NewProvision , reset 24h and error retry timers after validating the provision api response successfully JPT-632', () => {
      const pm = new RTCProvManager();
      jest.spyOn(pm, 'emit');
      jest.spyOn(pm, '_resetFreshTimer');
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      pm.doSipProvRequest();
      expect(pm.emit).toBeCalled();
      expect(pm._resetFreshTimer).toBeCalled();
      expect(pm._requestErrorRetryInterval).toBe(8);
    });

    it('should Retry request provision at 8,16,32...3600s(retryAfter < 8)  interval when request sip provision failed JPT-633', () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.status = 400;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      pm.doSipProvRequest();
      for (let i = 8; i <= 3600; i = i * 2) {
        const interval = Math.min(i, 3600);
        expect(pm.retrySeconds).toBe(interval);
        jest.advanceTimersByTime(interval * 1000);
      }
    });

    it('should Retry request provision at max(8,16,32...3600s,retryAfter)(retryAfter > 8)  interval when request sip provision failed ', () => {
      jest.useFakeTimers();
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.status = 400;
      mockProvResponse_unnormal.retryAfter = 2000;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      pm.doSipProvRequest();
      for (let i = 8; i <= 3600; i = i * 2) {
        const interval = Math.max(Math.min(i, 3600), 2000);
        expect(pm.retrySeconds).toBe(interval);
        jest.advanceTimersByTime(interval * 1000);
      }
    });

    it('should Retry request provision at 2h interval(retryAfter < 2h) when response is invalid JPT-658', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.device.transport = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      pm.doSipProvRequest();
      expect(pm.retrySeconds).toBe(7200);
    });

    it('should Retry request provision at retryAfter interval(retryAfter > 2h) when response is invalid', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.retryAfter = 7300;
      mockProvResponse_unnormal.data.device.transport = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      pm.doSipProvRequest();
      expect(pm.retrySeconds).toBe(7300);
    });

    it('should Do nothing when same sip provision is returned JPT-659', () => {
      const pm = new RTCProvManager();
      jest.spyOn(pm, 'emit');
      jest.spyOn(pm, '_resetFreshTimer');
      pm._sipProvisionInfo = mockProvData_normal;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_normal);
      pm.doSipProvRequest();
      expect(pm.emit).not.toBeCalled();
      expect(pm._resetFreshTimer).not.toBeCalled();
    });
  });

  describe('_checkSipProvInfoParame()', () => {
    it('should The provision response be invalid when Transport filed is missed JPT-634', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.transport;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Transport value is null JPT-647', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.transport = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Password filed is missed JPT-636', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.password;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Password value is null JPT-648', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.password = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Domain filed is missed JPT-637', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.domain;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Domain value is null JPT-649', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.domain = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Username filed is missed JPT-638', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.username;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Username value is null JPT-650', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.username = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Authorization filed is missed JPT-640', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.authorizationID;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when Authorization value is null JPT-651', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.authorizationID = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when OutboundProxy filed is missed JPT-641', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      delete mockProvResponse_unnormal.data.outboundProxy;
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });

    it('should The provision response be invalid when OutboundProxy value is null JPT-652', () => {
      const pm = new RTCProvManager();
      const mockProvResponse_unnormal = Object.create(mockProvResponse_normal);
      mockProvResponse_unnormal.data.outboundProxy = '';
      jest
        .spyOn(rtcRestApiManager, 'sendRequest')
        .mockReturnValue(mockProvResponse_unnormal);
      jest.spyOn(pm, '_checkSipProvInfoParame');
      pm.doSipProvRequest();
      expect(pm._checkSipProvInfoParame).lastReturnedWith(false);
    });
  });
});
