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

  @testable
  class addMediaUpdateListener {
    @test('should be update audio startTime zero when media ended')
    t1() {
      const phoneStore = new PhoneStore();
      class Media {
        events: any[] = [];
        on(eventName: string, handler: () => {}) {
          this.events.push({
            eventName,
            handler,
          });
          handler();
        }
        off(eventName: string, handler: () => {}) {}
      }
      const media = new Media();
      const audio = {
        media,
        startTime: 20,
      };
      const emit = (media: any, eventName: string, returnValue?: any) => {
        const event = media.events.filter(event => {
          return event.name === eventName;
        })[0];
        event && event.handler && event.handler(returnValue);
      };

      phoneStore.addAudio(1, audio);
      phoneStore.addMediaUpdateListener(1);
      expect(media.events.length).toEqual(1);

      emit(media, 'ended');
      expect(phoneStore.audioCache.get(1)).toEqual({
        media,
        startTime: 0,
      });
    }
  }
});
