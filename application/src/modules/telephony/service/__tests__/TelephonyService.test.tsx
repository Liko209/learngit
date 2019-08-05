import { ServiceConfig } from 'sdk/module/serviceLoader';
import { test, testable } from 'shield';
import { RCInfoService } from 'sdk/module/rcInfo';
import { mockContainer } from 'shield/application';
import { mockService } from 'shield/sdk/mockService';
import { TelephonyService as ServerTelephonyService } from 'sdk/module/telephony';
import { GlobalConfigService } from 'sdk/module/config';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { TelephonyService } from '../TelephonyService';

const globalConfigService = {
  name: ServiceConfig.GLOBAL_CONFIG_SERVICE,
  get: jest.fn(),
  put: jest.fn(),
};

const phoneNumberService = {
  name: ServiceConfig.PHONE_NUMBER_SERVICE,
  isShortNumber: jest.fn(),
  isValidNumber: jest.fn(),
};

describe('TelephonyService', () => {
  @testable
  class needE911Prompt {
    @test('should needE911Prompt if account has DL and emergency has benn confirmed')
    @mockService(RCInfoService, 'getDigitalLines', [1])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    async t1() {
      const ts = new TelephonyService();
      expect(await ts.needE911Prompt()).toBe(true);
    }

    @test('should not needE911Prompt if account does not have DL [JPT-2703]')
    @mockService(RCInfoService, 'getDigitalLines', [])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    async t2() {
      const ts = new TelephonyService();
      expect(await ts.needE911Prompt()).toBe(false);
    }

    @test('should not needE911Prompt if account has DL but emergency has not been confirmed')
    @mockService(RCInfoService, 'getDigitalLines', [1])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', false)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    async t3() {
      const ts = new TelephonyService();
      expect(await ts.needE911Prompt()).toBe(false);
    }
  }
});
