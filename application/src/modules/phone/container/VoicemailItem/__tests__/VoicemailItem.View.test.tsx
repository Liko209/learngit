/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-04 20:04:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { VoicemailItemView } from '../VoicemailItem.View';
import { JuiAudioMode } from '../types';

describe('VoicemailItem.View', () => {
  @testable
  class playerMode {
    @test(
      'should player progress show when hover and playing, and still show after pause, finally hide after not hover. [JPT-2377]',
    )
    t1() {
      const props = {
        isAudioActive: true,
        isHover: true,
        voiceMailResponsiveMap: {
          audioMode: JuiAudioMode.FULL,
          buttonToShow: 3,
          dateFormat: 'full',
        },
      };

      const wrapper = shallow(<VoicemailItemView {...props} />, {
        disableLifecycleMethods: true,
      });
      const instance: any = wrapper.instance();

      expect(instance.playerMode).toBe(JuiAudioMode.FULL);

      wrapper.setProps({ isAudioActive: false });
      expect(instance.playerMode).toBe(JuiAudioMode.FULL);

      wrapper.setProps({ isHover: false });
      expect(instance.playerMode).toBe(JuiAudioMode.MINI);
    }

    @test(
      'should player progress show when hover and keep show after playing. [JPT-2374]',
    )
    t2() {
      const props = {
        isAudioActive: false,
        isHover: true,
        voiceMailResponsiveMap: {
          audioMode: JuiAudioMode.FULL,
          buttonToShow: 3,
          dateFormat: 'full',
        },
      };

      const wrapper = shallow(<VoicemailItemView {...props} />, {
        disableLifecycleMethods: true,
      });
      const instance: any = wrapper.instance();

      expect(instance.playerMode).toBe(JuiAudioMode.FULL);

      wrapper.setProps({ isAudioActive: true });

      expect(instance.playerMode).toBe(JuiAudioMode.FULL);
    }
  }
});
