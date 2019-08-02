import { JuiAudioPlayer } from '../AudioPlayer';
import { shallow } from 'enzyme';
import { JuiAudioStatus } from '../types';
import { JuiAudioAction } from '../AudioAction';
import React from 'react';

describe('AudioPlayer', () => {
  it('should wrapped with tooltip [JPT-2551]', () => {
    const actionTips = {
      play: 'play',
      pause: 'pause',
      reload: 'reload',
    };
    const actions = {
      [JuiAudioStatus.PLAY]: {
        label: actionTips.play,
        tooltip: actionTips.play,
        handler: () => {},
      },
      [JuiAudioStatus.PAUSE]: {
        label: actionTips.pause,
        tooltip: actionTips.pause,
        handler: () => {},
      },
      [JuiAudioStatus.RELOAD]: {
        label: actionTips.reload,
        tooltip: actionTips.reload,
        handler: () => {},
      },
    };
    const wrapper = shallow(
      <JuiAudioPlayer actions={actions} status={'play'} />,
    );
    const action = wrapper.find(JuiAudioAction);
    expect(action.prop('tooltip')).toBe('play');
  });
});
