/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-08-03 17:43:20
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RTCSipEmergencyServiceAddr,
  RTCSipProvisionInfo,
  RTCSipFlags,
  RTCAccount,
} from 'voip';
import { TelephonyGlobalConfig } from '../config/TelephonyGlobalConfig';
import _ from 'lodash';
import { telephonyLogger } from 'foundation/log';
import { notificationCenter } from 'sdk/service';
import { SERVICE } from 'sdk/service/eventKey';

class E911Controller {
  private _emergencyAddr: RTCSipEmergencyServiceAddr | undefined = undefined;

  constructor(private _rtcAccount: RTCAccount) {}

  getLocalEmergencyAddress() {
    return TelephonyGlobalConfig.getEmergencyAddress();
  }

  setLocalEmergencyAddress(emergencyAddress: RTCSipEmergencyServiceAddr) {
    TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
    this._emergencyAddr = emergencyAddress;
  }

  updateLocalEmergencyAddress(emergencyAddress: RTCSipEmergencyServiceAddr) {
    this._emergencyAddr = emergencyAddress;
    TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
  }

  private _getComparableAddr(addr: RTCSipEmergencyServiceAddr) {
    const newAddr = _.cloneDeep(addr);
    // ignore country comparison
    newAddr.outOfCountry = true;

    // could be empty string
    newAddr.stateId = newAddr.stateId || '';
    newAddr.stateIsoCode = newAddr.stateIsoCode || '';
    newAddr.stateName = newAddr.stateName || '';
    newAddr.street2 = newAddr.street2 || '';
    newAddr.state = newAddr.state || '';

    return newAddr;
  }

  isAddressEqual(
    objAddr: RTCSipEmergencyServiceAddr,
    othAddr: RTCSipEmergencyServiceAddr,
  ) {
    if (_.isEqual(objAddr, othAddr)) {
      return true;
    }
    const addr1 = this._getComparableAddr(objAddr);
    const addr2 = this._getComparableAddr(othAddr);
    return _.isEqual(addr1, addr2);
  }

  getRemoteEmergencyAddress() {
    if (this._emergencyAddr) {
      // local EA will be used before refreshing sip prov
      return this._emergencyAddr;
    }
    const sipProv = this._rtcAccount.getSipProv();
    if (sipProv && sipProv.device) {
      return sipProv.device.emergencyServiceAddress;
    }
    return undefined;
  }

  onReceiveSipProv(
    newSipProv: RTCSipProvisionInfo,
    oldSipProv: RTCSipProvisionInfo,
  ) {
    // remove it once sip prov received
    this._emergencyAddr = undefined;
    notificationCenter.emit(SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_RECEIVED);
    if (oldSipProv && oldSipProv.device) {
      const oldAddr = oldSipProv.device.emergencyServiceAddress;
      const newAddr = newSipProv.device.emergencyServiceAddress;
      if (oldAddr && !newAddr) {
        telephonyLogger.info('No emergency address is found');
        notificationCenter.emit(
          SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_EA_UPDATED,
        );
      }
    }

    telephonyLogger.debug(`onReceiveNewProvFlags ${newSipProv} ${oldSipProv}`);
  }

  onReceiveNewProvFlags(sipFlags: RTCSipFlags) {
    telephonyLogger.debug(`onReceiveNewProvFlags ${sipFlags}`);
  }

  isEmergencyAddrConfirmed() {
    const localAddr = this.getLocalEmergencyAddress();
    if (!localAddr) {
      return false;
    }
    const remoteAddr = this.getRemoteEmergencyAddress();

    if (remoteAddr) {
      const res = this.isAddressEqual(localAddr, remoteAddr);
      !res && telephonyLogger.info('EA has been changed, need to update');
      return res;
    }
    return false;
  }
}

export { E911Controller };
