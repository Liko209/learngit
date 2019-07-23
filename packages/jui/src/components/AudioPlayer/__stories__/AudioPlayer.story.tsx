/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-22 16:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiAudioPlayer } from '../AudioPlayer';
import { JuiAudioMode, JuiAudioStatus } from '../types';

const actionTips = {
  play: 'play',
  pause: 'pause',
  reload: 'reload',
};

const mediaUrl =
  'https://mfile.bandari.net/mc-U52f5t5wDSe/Bandari/05Mist/04.Bandari.Net_Morning.mp3';

const AudioPlayer = (props: any) => {
  const audio = props.audio;

  const [mediaStatus, setMediaStatus] = useState(JuiAudioStatus.PLAY);
  const [mediaTimestamp, setMediaTimestamp] = useState(props.timestamp);
  const [mediaPlaying, setMediaPlaying] = useState(false);

  const actions = {
    [JuiAudioStatus.PLAY]: {
      label: actionTips.play,
      tooltip: actionTips.play,
      handler: () => {
        audio.currentTime = mediaTimestamp;
        audio.play();
      },
    },
    [JuiAudioStatus.PAUSE]: {
      label: actionTips.pause,
      tooltip: actionTips.pause,
      handler: () => {
        audio.pause();
      },
    },
    [JuiAudioStatus.RELOAD]: {
      label: actionTips.reload,
      tooltip: actionTips.reload,
      handler: () => {
        audio.load();
      },
    },
  };

  const timestampHandler = (timestamp: number) => {
    setMediaTimestamp(timestamp);
    if (mediaPlaying) {
      audio.currentTime = timestamp;
      audio.play();
    }
  };

  const processDragHandler = () => {
    setMediaPlaying(!audio.paused);
    audio.pause();
  };

  const onPlay = () => {
    setMediaStatus(JuiAudioStatus.PAUSE);
    audio.removeEventListener('play', onPlay, false);
  };
  audio.addEventListener('play', onPlay, false);

  const onPause = () => {
    setMediaStatus(JuiAudioStatus.PLAY);
    audio.removeEventListener('pause', onPlay, false);
  };
  audio.addEventListener('pause', onPause, false);

  const onTimeUpdate = () => {
    setMediaTimestamp(audio.currentTime);
    audio.removeEventListener('timeupdate', onTimeUpdate, false);
  };
  audio.addEventListener('timeupdate', onTimeUpdate, false);

  const onError = () => {
    setMediaStatus(JuiAudioStatus.RELOAD);
    audio.removeEventListener('error', onError, false);
  };
  audio.addEventListener('error', onError, false);

  const onLoadeddata = () => {
    audio.currentTime = mediaTimestamp;
    audio.removeEventListener('loadeddata', onLoadeddata, false);
  };
  audio.addEventListener('loadeddata', onLoadeddata, false);

  return (
    <JuiAudioPlayer
      status={mediaStatus}
      mode={props.mode}
      duration={props.duration}
      timestamp={mediaTimestamp}
      isHighlight={props.isHighlight}
      actions={actions}
      onPlay={props.onPlay}
      onPause={props.onPause}
      onReload={props.onReload}
      onTimeStampChanged={timestampHandler}
      onProcessDragged={processDragHandler}
    />
  );
};

storiesOf('Pattern', module).add('AudioPlayer', () => (
  <dl>
    <dt>mode tiny</dt>
    <dd>
      <AudioPlayer audio={new Audio(mediaUrl)} mode={JuiAudioMode.TINY} />
    </dd>
    <dt>mode mini</dt>
    <dd>
      <AudioPlayer
        audio={new Audio(mediaUrl)}
        mode={JuiAudioMode.MINI}
        duration={188}
        timestamp={0}
      />
    </dd>
    <dt>mode full</dt>
    <dd>
      <AudioPlayer audio={new Audio(mediaUrl)} duration={188} timestamp={30} />
    </dd>
    <dt>highlight display</dt>
    <dd>
      <AudioPlayer
        audio={new Audio(mediaUrl)}
        isHighlight
        duration={188}
        timestamp={60}
      />
    </dd>
    <dt>reload display</dt>
    <dd>
      <AudioPlayer
        audio={new Audio('example.mp3')}
        duration={188}
        timestamp={90}
      />
    </dd>
  </dl>
));
