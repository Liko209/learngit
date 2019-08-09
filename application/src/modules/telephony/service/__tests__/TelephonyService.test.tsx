import { ServiceConfig } from 'sdk/module/serviceLoader';
import { test, testable } from 'shield';
import { RCInfoService } from 'sdk/module/rcInfo';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk/mockService';
import { TelephonyService as ServerTelephonyService } from 'sdk/module/telephony';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { TelephonyStore } from '../../store';
import { OpenDialogE911 } from '../../container/E911';
import { runInAction } from 'mobx';
import { jupiter } from 'framework';
import { MediaService } from '@/modules/media/service';
import { IMediaService } from '@/interface/media';
import { ENTITY_NAME } from '@/store';
import { config } from '@/modules/telephony/module.config';
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
  const mockVolumeEntity = (name: string, id: any) => {
    if (name === ENTITY_NAME.USER_SETTING) {
      return { value: 1 };
    }
    return {};
  };

  @testable
  class needE911Prompt {
    beforeAll() {
      jupiter.registerService(IMediaService, MediaService);
      jupiter.registerModule(config);
    }

    @mockEntity(mockVolumeEntity)
    beforeEach() {}
    @test(
      'should needE911Prompt if account has DL and emergency has been confirmed',
    )
    @mockService(RCInfoService, 'getDigitalLines', [1])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    async t1() {
      let ts;
      runInAction(() => {
        ts = jupiter.get(TELEPHONY_SERVICE);
      });
      expect(await ts.needE911Prompt()).toBe(true);
    }

    @test('should not needE911Prompt if account does not have DL [JPT-2703]')
    @mockService.resolve(RCInfoService, 'getDigitalLines', [])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    async t2() {
      let ts;
      runInAction(() => {
        ts = jupiter.get(TELEPHONY_SERVICE);
      });
      expect(await ts.needE911Prompt()).toBe(false);
    }

    @test(
      'should not needE911Prompt if account has DL but emergency has not been confirmed',
    )
    @mockService.resolve(RCInfoService, 'getDigitalLines', [1])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', false)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    async t3() {
      let ts;
      runInAction(() => {
        ts = jupiter.get(TELEPHONY_SERVICE);
      });
      expect(await ts.needE911Prompt()).toBe(false);
    }
  }

  @testable
  class openE911 {
    beforeAll() {
      if (!jupiter.get(IMediaService)) {
        jupiter.registerService(IMediaService, MediaService);
      }
    }
    @mockEntity(mockVolumeEntity)
    beforeEach() {}
    @test('should show E911 if not have been show E911')
    @mockService.resolve(RCInfoService, 'getDigitalLines', [])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed')
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    @mockService(TelephonyStore, [
      { method: 'hasShowE911', data: false },
      { method: 'switchE911Status', data: true },
    ])
    t1() {
      (OpenDialogE911 as jest.Mock) = jest.fn();
      let ts;
      runInAction(() => {
        ts = new TelephonyService();
        ts.openE911();
        expect(OpenDialogE911).toHaveBeenCalled();
      });
    }

    @test('should not show E911 if have been show E911')
    @mockService.resolve(RCInfoService, 'getDigitalLines', [])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed')
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t2() {
      (OpenDialogE911 as jest.Mock) = jest.fn();
      let ts;
      runInAction(() => {
        ts = new TelephonyService();
        ts['_telephonyStore'] = { hasShowE911: true };
        ts.openE911();
        expect(OpenDialogE911).not.toHaveBeenCalled();
      });
    }
  }
});
