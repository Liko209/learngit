/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-08-04 11:48:57
 * Copyright © RingCentral. All rights reserved.
 */
import { E911Controller } from '../E911Controller';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';
import notificationCenter from '../../../../service/notificationCenter';
import { SERVICE } from '../../../../service/eventKey';
import { func } from 'prop-types';

describe('E911Controller', () => {
  let e911Controller: E911Controller;
  const rtcAccount = {
    getSipProv: jest.fn(),
  };

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    e911Controller = new E911Controller(rtcAccount);
  });

  describe('setLocalEmergencyAddress', () => {
    it('should save emergency address to local', () => {
      const addr = { a: 'test' };
      TelephonyGlobalConfig.setEmergencyAddress = jest.fn();
      e911Controller.setLocalEmergencyAddress(addr);
      expect(TelephonyGlobalConfig.setEmergencyAddress).toHaveBeenCalledWith(
        addr,
      );
      expect(e911Controller._emergencyAddr).toBe(addr);
    });
  });

  describe('updateLocalEmergencyAddress', () => {
    it('should update emergency address to local', () => {
      const addr = { a: 'test' };
      TelephonyGlobalConfig.setEmergencyAddress = jest.fn();
      e911Controller.updateLocalEmergencyAddress(addr);
      expect(TelephonyGlobalConfig.setEmergencyAddress).toHaveBeenCalledWith(
        addr,
      );
      expect(e911Controller._emergencyAddr).toBe(addr);
    });
  });

  describe('onReceiveSipProv', () => {
    it('should not emit if no old sip prov', () => {
      const spy = jest.spyOn(notificationCenter, 'emit');
      e911Controller.onReceiveSipProv(undefined, undefined);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_RECEIVED,
      );
    });
    it('should not emit when EA in sip prov is not removed', () => {
      const sipProv = { device: { emergencyServiceAddress: { a: 'test' } } };
      const spy = jest.spyOn(notificationCenter, 'emit');
      e911Controller.onReceiveSipProv(sipProv, sipProv);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_RECEIVED,
      );
    });
    it('should emit when EA in sip prov is removed [JPT-2696]', () => {
      const oldSipProv = { device: { emergencyServiceAddress: { a: 'test' } } };
      const newSipProv = { device: {} };
      const spy = jest.spyOn(notificationCenter, 'emit');
      e911Controller.onReceiveSipProv(newSipProv, oldSipProv);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_RECEIVED,
      );
      expect(spy).toHaveBeenCalledWith(
        SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_EA_UPDATED,
      );
      expect(e911Controller._emergencyAddr).toBe(undefined);
    });
  });

  describe('isEmergencyAddrConfirmed', () => {
    it('should return false when no local address [JPT-2705] ', () => {
      e911Controller.getLocalEmergencyAddress = jest.fn().mockReturnValue(null);
      const res = e911Controller.isEmergencyAddrConfirmed();
      expect(res).toBeFalsy();
    });
    it('should return true when local address is set, but no address in sip prov', () => {
      e911Controller.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue({ a: 'a', b: 'b' });
      e911Controller.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(undefined);
      const res = e911Controller.isEmergencyAddrConfirmed();
      expect(res).toBeFalsy();
    });

    it('should return false when local address is not equal to remote address', () => {
      e911Controller.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue({ a: 'a', b: 'b' });
      e911Controller.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue({ b: 'c', a: 'a' });
      const res = e911Controller.isEmergencyAddrConfirmed();
      expect(res).toBeFalsy();
    });

    it('should return true when local address is  equal to remote address [JPT-2706]', () => {
      e911Controller.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue({ a: 'a', b: 'b' });
      e911Controller.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue({ b: 'b', a: 'a' });
      const res = e911Controller.isEmergencyAddrConfirmed();
      expect(res).toBeTruthy();
    });
  });

  describe('getLocalEmergencyAddress', () => {
    it('should get emergency address from config', () => {
      TelephonyGlobalConfig.getEmergencyAddress = jest.fn();
      e911Controller.getLocalEmergencyAddress();
      expect(TelephonyGlobalConfig.getEmergencyAddress).toHaveBeenCalled();
    });
  });

  describe('getRemoteEmergencyAddress', () => {
    it('should get remote addr from cache', () => {
      const addr = { a: 'a' };
      Object.assign(e911Controller, {
        _emergencyAddr: addr,
      });
      const res = e911Controller.getRemoteEmergencyAddress();
      expect(res).toBe(addr);
    });
    it('should get emergency address from rtc account', () => {
      const addr = { b: 'b' };
      rtcAccount.getSipProv = jest.fn().mockReturnValue({
        device: {
          emergencyServiceAddress: addr,
        },
      });
      const res = e911Controller.getRemoteEmergencyAddress();
      expect(res).toBe(addr);
    });
    it('should return undefined when no addr in rtc account', () => {
      rtcAccount.getSipProv = jest.fn().mockReturnValue(null);
      const res = e911Controller.getRemoteEmergencyAddress();
      expect(res).toBe(undefined);
    });
  });
});
