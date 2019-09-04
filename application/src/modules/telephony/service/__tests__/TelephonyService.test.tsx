import { ServiceConfig } from 'sdk/module/serviceLoader';
import { test, testable } from 'shield';
import { RCInfoService } from 'sdk/module/rcInfo';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk/mockService';
import { TelephonyService as ServerTelephonyService } from 'sdk/module/telephony';
import { TelephonyStore } from '../../store';
import { OpenDialogE911 } from '../../container/E911';
import { runInAction } from 'mobx';
import { jupiter } from 'framework/Jupiter';
import { MediaService } from '@/modules/media/service';
import { IMediaService } from '@/interface/media';
import { ENTITY_NAME } from '@/store';
import { config } from '@/modules/telephony/module.config';
import { TelephonyService } from '../TelephonyService';
import { Notification } from '@/containers/Notification';
import { MAKE_CALL_ERROR_CODE } from 'sdk/module/telephony/types';
import { errorHelper, JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';
jupiter.registerModule(config);

const globalConfigService = {
  name: ServiceConfig.GLOBAL_CONFIG_SERVICE,
  get() { },
  put() { },
};

const phoneNumberService = {
  name: ServiceConfig.PHONE_NUMBER_SERVICE,
  isShortNumber() { },
  isValidNumber() { },
};

const itemService = {
  name: ServiceConfig.ITEM_SERVICE,
  startConference() { }
}

const rcInfoService = {
  name: ServiceConfig.RC_INFO_SERVICE,
  isVoipCallingAvailable() { }
}

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
    }

    @mockEntity(mockVolumeEntity)
    beforeEach() { }
    @test(
      'should needE911Prompt if account has DL and emergency has been confirmed',
    )
    @mockService.resolve(RCInfoService, 'getDigitalLines', [1])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t1() {
      let ts;
      runInAction(() => {
        ts = new TelephonyService();
      });
      expect(ts.needE911Prompt()).resolves.toBe(true);
    }

    @test('should not needE911Prompt if account does not have DL [JPT-2703]')
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t2() {
      let ts;
      runInAction(() => {
        ts = new TelephonyService();
        ts['_rcInfoService'] = { getDigitalLines: () => [] };
      });
      expect(ts.needE911Prompt()).resolves.toBe(false);
    }

    @test(
      'should not needE911Prompt if account has DL but emergency has not been confirmed',
    )
    @mockService.resolve(RCInfoService, 'getDigitalLines', [1])
    @mockService(ServerTelephonyService, 'isEmergencyAddrConfirmed', false)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t3() {
      let ts;
      runInAction(() => {
        ts = new TelephonyService();
      });
      expect(ts.needE911Prompt()).resolves.toBe(false);
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
    beforeEach() { }
    @test('should show E911 if not have been show E911')
    @mockService(ServerTelephonyService, [
      { method: 'isEmergencyAddrConfirmed', data: true },
      { method: 'hasActiveDL', data: true },
    ])
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
    @mockService(ServerTelephonyService, [
      { method: 'isEmergencyAddrConfirmed', data: false },
      { method: 'hasActiveDL', data: true },
    ])
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

  @testable
  class startAudioConference {
    @test(
      'should not call if there is already another call going on',
    )
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 1 },
    ])
    @mockService(itemService, 'startConference')
    t0() {
      let ts;
      runInAction(async () => {
        ts = new TelephonyService();
        const result = await ts.startAudioConference(123);
        expect(result).toBe(true);
        expect(itemService.startConference).not.toHaveBeenCalled()
      });
    }

    @test(
      'should not call api if has no active DL',
    )
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 0 },
      { method: 'isEmergencyAddrConfirmed', data: true },
      { method: 'hasActiveDL', data: false },
    ])
    @mockService(itemService, 'startConference')
    @mockService(rcInfoService, 'isVoipCallingAvailable', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t1(done: any) {
      Notification.flashToast = jest.fn()
      let ts;
      runInAction(async () => {
        ts = new TelephonyService();
        const result = await ts.startAudioConference(123);
        expect(result).toBe(false);
        expect(itemService.startConference).not.toHaveBeenCalled();
        done();
      });
    }

    @test(
      'should call start conference api when it is allowed',
    )
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 0 },
      { method: 'isEmergencyAddrConfirmed', data: true },
      { method: 'hasActiveDL', data: true },
      { method: 'makeCall', data: MAKE_CALL_ERROR_CODE.NO_ERROR },
    ])
    @mockService(itemService, 'startConference', { rc_data: { hostCode: '292209719', phoneNumber: '(267) 930-4000' } })
    @mockService(rcInfoService, 'isVoipCallingAvailable', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t2(done: any) {
      Notification.flashToast = jest.fn();
      let ts;
      runInAction(async () => {
        ts = new TelephonyService();
        ts.isValidNumber = jest.fn().mockResolvedValue({ isValid: true })
        ts._isJupiterDefaultApp = jest.fn().mockResolvedValue(true)
        ts._getFromNumber = jest.fn().mockResolvedValue('123123233')
        const result = await ts.startAudioConference(123);
        expect(result).toBe(true);
        expect(itemService.startConference).toHaveBeenCalled();
        expect(ts._telephonyStore.isConference).toBe(true);
        done()
      });
    }

    @test(
      'should show toast when error occurs when starting conference',
    )
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 0 },
      { method: 'isEmergencyAddrConfirmed', data: true },
      { method: 'hasActiveDL', data: true },
      { method: 'makeCall', data: MAKE_CALL_ERROR_CODE.NO_ERROR },
    ])
    @mockService.reject(itemService, 'startConference', () => {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NETWORK_ERROR,
        'Api Error: Please check whether server crash',
      )
    })
    @mockService(rcInfoService, 'isVoipCallingAvailable', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService)
    t3(done: any) {
      Notification.flashToast = jest.fn()
      let ts;
      runInAction(async () => {
        jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(true);
        ts = new TelephonyService();
        ts.isValidNumber = jest.fn().mockResolvedValue({ isValid: true })
        ts._isJupiterDefaultApp = jest.fn().mockResolvedValue(true)
        ts._getFromNumber = jest.fn().mockResolvedValue('123123233')
        const result = await ts.startAudioConference(123);
        expect(result).toBe(false);
        expect(itemService.startConference).toHaveBeenCalled();
        expect(Notification.flashToast).toHaveBeenCalledWith(expect.objectContaining({
          message: 'telephony.prompt.audioConferenceNetworkError'
        }));
        done();
      });
    }
  }

  @testable
  class directCall {
    beforeEach() { }
    @test(
      'should not display the toast of no digital line when making an extension call [FIJI-8710]',
    )
    @mockService(ServerTelephonyService, [
      { method: 'getAllCallCount', data: 0 },
      { method: 'isEmergencyAddrConfirmed', data: true },
      { method: 'hasActiveDL', data: false },
    ])
    @mockService(rcInfoService, 'isVoipCallingAvailable', true)
    @mockService(globalConfigService)
    @mockService(phoneNumberService, 'isShortNumber', true)
    t1(done: any) {
      Notification.flashToast = jest.fn()
      let ts;
      runInAction(async () => {
        ts = new TelephonyService();
        ts._makeCall = jest.fn()
        await ts.directCall('123');
        expect(ts._makeCall).toHaveBeenCalled();
        expect(Notification.flashToast).not.toHaveBeenCalled();
        done();
      });
    }
  }
});
