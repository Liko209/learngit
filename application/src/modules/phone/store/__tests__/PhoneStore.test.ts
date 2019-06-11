/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-04 15:07:18
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';

import { PhoneStore } from '../PhoneStore';
import { Audio } from '../../types';

describe('PhoneStore', () => {
  @testable
  class addAudio {
    @test('should has audio if call addAudio [JPT-2219]')
    t1() {
      const phoneStore = new PhoneStore();
      const audio = {
        vmDuration: 5,
      } as Audio;
      phoneStore.addAudio(1, audio);
      expect(phoneStore.audioCache.get(1)).toEqual(audio);
    }
  }

  @testable
  class selectedVoicemailId {
    @test('should be 1 if set voicemail id 1')
    t1() {
      const phoneStore = new PhoneStore();
      phoneStore.setVoicemailId(1);
      expect(phoneStore.voicemailId).toBe(1);
    }

    @test('should be null if set null')
    t2() {
      const phoneStore = new PhoneStore();
      phoneStore.setVoicemailId(null);
      expect(phoneStore.voicemailId).toBeNull();
    }
  }

  @testable
  class updateAudio {
    @test('should be update audio property if update audio [JPT-2219]')
    t1() {
      const phoneStore = new PhoneStore();
      const audio = {
        vmDuration: 5,
      } as Audio;
      phoneStore.addAudio(1, audio);
      phoneStore.updateAudio(1, {
        vmDuration: 6,
      } as Audio);
      expect(phoneStore.audioCache.get(1)).toEqual({
        vmDuration: 6,
      });
    }
  }
});
