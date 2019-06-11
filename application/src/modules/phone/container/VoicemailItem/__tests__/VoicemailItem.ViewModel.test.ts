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
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { postTimestamp } from '@/utils/date';

import { VoicemailItemViewModel } from '../VoicemailItem.ViewModel';
import { config } from '../../../module.config';
import { PhoneStore } from '../../../store';
import { JuiAudioMode } from '../types';

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
    @mockEntity({
      readStatus: READ_STATUS.UNREAD,
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.isUnread).toBeTruthy();
    }

    @test('should be return false if is read')
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
    @mockEntity({})
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.attachment).toBeUndefined();
    }

    @test('should get audio if has attachments and type is AUDIO_RECORDING')
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
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        },
      ],
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.audio).toBeUndefined();
      when(
        () => !!vm.audio,
        () => {
          expect(vm.audio).toEqual({
            type: ATTACHMENT_TYPE.AUDIO_RECORDING,
          });
        },
      );
    }
  }

  @testable
  class selected {
    @mockEntity({
      attachments: [],
    })
    beforeEach() {}

    @test('should be true if phone store voicemailId equal vm id')
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(1);
      expect(vm.selected).toBeTruthy();
    }

    @test('should be false if phone store voicemailId not equal vm id')
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(2);
      expect(vm.selected).toBeFalsy();
    }
  }

  @testable
  class mode {
    @test('should be undefined if not has audio')
    @mockEntity({
      attachments: [],
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      expect(vm.mode).toBeUndefined();
    }

    @test('should be FULL mode if selected')
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.TEXT,
        },
      ],
    })
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(1);
      expect(vm.mode).toBeUndefined();
      when(
        () => !!vm.mode,
        () => {
          expect(vm.mode).toEqual(JuiAudioMode.FULL);
        },
      );
    }

    @test('should be MINI mode if not selected')
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.TEXT,
        },
      ],
    })
    t3() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const phoneStore = container.get(PhoneStore);
      phoneStore.setVoicemailId(2);
      when(
        () => !!vm.mode,
        () => {
          expect(vm.mode).toEqual(JuiAudioMode.MINI);
        },
      );
    }
  }

  @testable
  class onChange {
    @mockEntity({
      attachments: [],
    })
    beforeEach() {}

    @test('should be set voicemailId if expansion is true')
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      vm.onChange({} as any, true);
      const phoneStore = container.get(PhoneStore);
      expect(phoneStore.voicemailId).toBe(1);
    }

    @test('should be set voicemailId null if expansion is false')
    t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      vm.onChange({} as any, false);
      const phoneStore = container.get(PhoneStore);
      expect(phoneStore.voicemailId).toBeNull();
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
  class updateAudioUri {
    @test('should call flash toast if load error [JPT-2225]')
    @mockEntity({
      attachments: [],
    })
    async t1() {
      jest.spyOn(Notification, 'flashToast').mockImplementation();
      const vm = new VoicemailItemViewModel({ id: 1 });
      await vm.updateAudioUri();
      expect(Notification.flashToast).toHaveBeenCalledWith({
        message: 'phone.prompt.playVoicemailLoadError',
        autoHideDuration: 3000,
        type: ToastType.ERROR,
        fullWidth: false,
        dismissible: false,
        messageAlign: ToastMessageAlign.LEFT,
      });
    }

    @test('should return undefined if audio')
    @mockEntity({
      attachments: [],
    })
    async t2() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      const ret = await vm.updateAudioUri();
      expect(ret).toBeUndefined();
    }

    @test('should return undefined if audio')
    @mockEntity({
      attachments: [
        {
          type: ATTACHMENT_TYPE.TEXT,
        },
      ],
    })
    @mockService(voicemailService, 'buildDownloadUrl')
    async t3() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      await vm.updateAudioUri();
      when(
        () => !!vm.audio,
        () => {
          expect(voicemailService.buildDownloadUrl).toHaveBeenCalled();
        },
      );
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
      when(
        () => !!vm.audio,
        () => {
          vm.updateStartTime(123);
          const audio = phoneStore.audioCache.get(1);
          expect(audio).toEqual({
            type: ATTACHMENT_TYPE.TEXT,
            startTime: 123,
          });
        },
      );
    }
  }

  @testable
  class shouldPause {
    @test('should be true if has incoming call [JPT-2222]')
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
  class createTime {
    @test('should be call postTimestamp if get createTime [JPT-2144]')
    @mockEntity({
      creationTime: 'creationTime',
    })
    t1() {
      const vm = new VoicemailItemViewModel({ id: 1 });
      vm.createTime;
      expect(postTimestamp).toHaveBeenCalledWith('creationTime');
    }
  }
});
