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
  const audioPlayer = {
    current: {
      pause: jest.fn(),
    },
  };
  @testable
  class componentWillUnmount {
    // switch tab should be pause
    @test('should be paused before unmount if selected [JPT-2219]')
    t1() {
      const props = {
        selected: true,
        onVoicemailPlay: () => {},
        voiceMailResponsiveMap: { dateFormat: 'full' },
      };
      const wrapper = shallow(<VoicemailItemView {...props} />, {
        disableLifecycleMethods: true,
      });
      const inst = wrapper.instance();
      inst._AudioPlayer = audioPlayer;
      wrapper.unmount();
      expect(audioPlayer.current.pause).toHaveBeenCalled();
    }

    @test(
      'should clear play record before unmount if selected [JPT-2503] [JPT-2502]',
    )
    t2() {
      const props = {
        selected: true,
        onVoicemailPlay: jest.fn(),
        voiceMailResponsiveMap: { dateFormat: 'full' },
      };
      const wrapper = shallow(<VoicemailItemView {...props} />, {
        disableLifecycleMethods: true,
      });
      wrapper.unmount();
      expect(props.onVoicemailPlay).toHaveBeenCalledWith(null);
    }
  }

  @testable
  class componentDidUpdate {
    @test(
      'should only manual pause audio when selected status change from true to false [JPT-2222]',
    )
    t1() {
      const props = {
        dateFormat: 'full',
        selected: false,
        isHover: false,
        isUnread: false,
      };

      const wrapper = shallow(
        <VoicemailItemView voiceMailResponsiveMap={props} />,
      );

      const instance = wrapper.instance();
      instance._AudioPlayer = audioPlayer;

      wrapper.setProps({ selected: true });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();

      wrapper.setProps({ isHover: true, isUnread: true });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();

      wrapper.setProps({ selected: false });
      expect(audioPlayer.current.pause).toHaveBeenCalled();
    }
  }

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
