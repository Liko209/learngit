/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-02 13:00:25
 * Copyright © RingCentral. All rights reserved.
 */
import { when } from 'mobx';
import { container } from 'framework';
import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { registerModule } from 'shield/utils';
import { globalStore } from 'shield/integration-test';
import { READ_STATUS, ATTACHMENT_TYPE } from 'sdk/module/RCItems/constants';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { Notification } from '@/containers/Notification';
import { RCInfoService } from 'sdk/module/rcInfo';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { postTimestamp } from '@/utils/date';

import { VoicemailItemViewModel } from '../VoicemailItem.ViewModel';
import { config } from '../../../module.config';
import { PhoneStore } from '../../../store';
import { JuiAudioStatus } from '../types';

jest.mock('@/utils/date');
jest.mock('@/containers/Notification');

registerModule(config);

describe('VoicemailItemViewModel', () => {
  const voicemailService = {
    name: ServiceConfig.VOICEMAIL_SERVICE,
    buildDownloadUrl() {},
    updateReadStatus() {},
  };

  @testable
  class caller {
    @test('should be return caller if voicemail has from')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      from: {},
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.caller).toEqual({});
    }
  }
  @testable
  class isUnread {
    @test('should be return true if is unread')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      readStatus: READ_STATUS.UNREAD,
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.isUnread).toBeTruthy();
    }

    @test('should be return false if is read')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      readStatus: READ_STATUS.READ,
    })
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.isUnread).toBeFalsy();
    }
  }

  @testable
  class attachment {
    @test('should be undefined if not attachment')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({})
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.attachment).toBeUndefined();
    }

    @test('should get audio if has attachments and type is AUDIO_RECORDING')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        },
      ],
    })
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.attachment).toEqual({
        type: ATTACHMENT_TYPE.AUDIO_RECORDING,
      });
    }

    @test(
      'should get undefined if has attachments and type not AUDIO_RECORDING',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.TEXT,
        },
      ],
    })
    t3() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.attachment).toBeUndefined();
    }
  }

  @testable
  class audio {
    @test('should get audio if attachment is audio')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [
        {
          id: 1,
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        },
      ],
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.audio).toEqual({
        type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        downloadUrl: '',
        startTime: 0,
        id: 1,
      });
    }
  }

  @testable
  class selected {
    @mockEntity({
      attachments: [],
    })
    beforeEach() {}

    @test('should be true if phone store voicemailId equal vm id')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(1);
      expect(vm.selected).toBeTruthy();
    }

    @test('should be false if phone store voicemailId not equal vm id')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(2);
      expect(vm.selected).toBeFalsy();
    }
  }

  @testable
  class isAudioActive {
    @test('should be false if not has audio')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [],
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.isAudioActive).toBeFalsy();
    }

    @test('should be true if selected and startTime > 0')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [
        {
          id: 1,
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
          startTime: 0,
        },
      ],
    })
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(1);
      phoneStore.updateAudio(1, {
        startTime: 1,
      });
      expect(vm.isAudioActive).toBeTruthy();
    }

    @test('should be false if startTime === 0')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [
        {
          id: 1,
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
          startTime: 0,
        },
      ],
    })
    t3() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(1);
      expect(vm.isAudioActive).toBeFalsy();
    }

    @test('should be false if not selected')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [
        {
          id: 1,
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
          startTime: 0,
        },
      ],
    })
    t4() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(2);
      expect(vm.isAudioActive).toBeFalsy();
    }
  }

  @testable
  class onChange {
    @mockEntity({
      attachments: [],
    })
    beforeEach() {}

    @test('should be set voicemailId if expansion is true')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      vm.onChange({} as any, true);
      const phoneStore = container.get(PhoneStore);
      expect(phoneStore.voicemailId).toBe(1);
    }

    @test('should be set voicemailId null if expansion is false')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      vm.onChange({} as any, false);
      const phoneStore = container.get(PhoneStore);
      expect(phoneStore.voicemailId).toBeNull();
    }
  }

  @testable
  class onBeforeAction {
    @test('should be buildDownloadUrl if before start')
    @mockEntity({
      attachments: [
        {
          id: 1,
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
          uri: 'www.google.com',
        },
      ],
    })
    @mockService(
      voicemailService,
      'buildDownloadUrl',
      'www.google.com?token=token',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    async t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      await vm.onBeforeAction(JuiAudioStatus.PLAY);
      when(
        () => !!vm.audio,
        () => {
          expect(voicemailService.buildDownloadUrl).toHaveBeenCalledWith(
            'www.google.com',
          );
          const phoneStore = container.get(PhoneStore);
          expect(phoneStore.audioCache.get(1)).toEqual({
            id: 1,
            type: ATTACHMENT_TYPE.AUDIO_RECORDING,
            uri: 'www.google.com',
            startTime: 0,
            downloadUrl: 'www.google.com?token=token',
          });
        },
      );
    }
  }

  @testable
  class onBeforePlay {
    @test(
      'should be set voicemailId and read if voicemail not selected and to play audio [JPT-2218]',
    )
    @mockEntity({
      attachments: [],
    })
    @mockService(voicemailService, 'updateReadStatus')
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      vm.onBeforePlay();
      expect(phoneStore.voicemailId).toBe(1);
      expect(voicemailService.updateReadStatus).toHaveBeenCalled();
    }
  }

  @testable
  class onError {
    @test('should call flash toast if load error [JPT-2225]')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [],
    })
    async t1() {
      jest.spyOn(Notification, 'flashToast').mockImplementation();
      const vm = new VoicemailItemViewModel({ id: 1 });
      await vm.onError();
      expect(Notification.flashToast).toHaveBeenCalledWith({
        message: 'phone.prompt.playVoicemailLoadError',
        autoHideDuration: 3000,
        type: ToastType.ERROR,
        fullWidth: false,
        dismissible: false,
        messageAlign: ToastMessageAlign.LEFT,
      });
    }
  }

  @testable
  class updateStartTime {
    @test(
      'should call phone store updateAudio if updateStartTime have been called',
    )
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        },
      ],
    })
    @mockService(voicemailService, 'buildDownloadUrl')
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      vm.updateStartTime(123);
      const audio = phoneStore.audioCache.get(1);
      expect(audio).toEqual({
        type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        startTime: 123,
        downloadUrl: '',
      });
    }
  }

  @testable
  class shouldPause {
    @test('should be true if has incoming call [JPT-2222]')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      attachments: [],
    })
    async t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      globalStore.set(GLOBAL_KEYS.INCOMING_CALL, true);
      await when(
        () => getGlobalValue(GLOBAL_KEYS.INCOMING_CALL),
        () => {
          expect(vm.shouldPause).toBeTruthy();
        },
      );
    }
  }

  @testable
  class shouldShowCall {
    @test('should be true if has call permission [JPT-2384]')
    @mockService(RCInfoService, [
      {
        method: 'isRCFeaturePermissionEnabled',
        data: true,
      },
      {
        method: 'isVoipCallingAvailable',
        data: false,
      },
    ])
    @mockEntity({
      attachments: [],
    })
    async t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(await vm.shouldShowCall()).toBeFalsy();
    }
  }
});
