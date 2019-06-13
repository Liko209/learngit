/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-04 20:04:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { test, testable } from 'shield';
import { shallow } from 'enzyme';
import { VoicemailItemView } from '../VoicemailItem.View';

describe('VoicemailItem.View', () => {
  const audioPlayer = {
    current: {
      pause: jest.fn(),
    },
  };
  @testable
  class componentWillUnmount {
    // switch tab should be pause
    @test('should be pause if unmount component [JPT-2219]')
    t1() {
      const props = {};
      const wrapper = shallow(<VoicemailItemView {...props} />);
      const inst = wrapper.instance();
      inst._AudioPlayer = audioPlayer;
      wrapper.unmount();
      expect(audioPlayer.current.pause).toHaveBeenCalled();
    }
  }

  @testable
  class componentDidUpdate {
    @test('should not be called if selected is true [JPT-2222]')
    t1() {
      const wrapper = shallow(<VoicemailItemView />);
      wrapper.setProps({
        selected: true,
      });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();
    }

    @test('should not be called if shouldPause is false [JPT-2222]')
    t2() {
      const wrapper = shallow(<VoicemailItemView />);
      wrapper.setProps({
        selected: false,
      });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();
    }

    @test(
      'should not be called if shouldPause is false && selected is true [JPT-2222]',
    )
    t3() {
      const wrapper = shallow(<VoicemailItemView />);
      wrapper.setProps({
        selected: true,
        shouldPause: false,
      });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();
    }

    @test(
      'should not be called if shouldPause is true && selected is false [JPT-2222]',
    )
    t4() {
      const wrapper = shallow(<VoicemailItemView />);
      wrapper.setProps({
        selected: false,
        shouldPause: true,
      });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();
    }

    @test('should not be called if current is null [JPT-2222]')
    t5() {
      const wrapper = shallow(<VoicemailItemView />);
      const inst = wrapper.instance();
      inst._AudioPlayer = {
        current: null,
      };
      wrapper.setProps({
        shouldPause: true,
      });
      expect(audioPlayer.current.pause).not.toHaveBeenCalled();
    }

    @test('should be called if shouldPause is true && has current [JPT-2222]')
    t6() {
      const wrapper = shallow(<VoicemailItemView />);
      const inst = wrapper.instance();
      inst._AudioPlayer = audioPlayer;
      wrapper.setProps({
        shouldPause: true,
      });
      expect(audioPlayer.current.pause).toHaveBeenCalled();
    }

    @test('should be called if selected is false && has current [JPT-2222]')
    t7() {
      const wrapper = shallow(<VoicemailItemView />);
      const inst = wrapper.instance();
      inst._AudioPlayer = audioPlayer;
      wrapper.setProps({
        selected: false,
      });
      expect(audioPlayer.current.pause).toHaveBeenCalled();
    }
  }
});
