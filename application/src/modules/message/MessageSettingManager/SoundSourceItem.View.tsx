/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-07-23 11:08:47
 * Copyright Â© RingCentral. All rights reserved.
 */
import React, { useEffect, useState } from 'react';
import { i18nP } from '@/utils/i18nT';
import { AudioPlayerButton } from '@/modules/media/container/AudioPlayerButton';
import { JuiTextWithEllipsis } from 'jui/components/Text/TextWithEllipsis';
import { JuiAudioStatus } from 'jui/pattern/AudioPlayer';
import { container } from 'framework/src';
import { ISoundNotification, Sounds } from '@/modules/notification/interface';
import { IMedia } from '@/interface/media';
import {
  AUDIO_SOUNDS_INFO,
  RINGS_TYPE,
  SOUNDS_TYPE,
} from 'sdk/src/module/profile';

type SoundItemProps = {
  value: AUDIO_SOUNDS_INFO;
};

function useSound(soundName: Sounds) {
  const [state, setState] = useState<IMedia | undefined>(undefined);
  useEffect(() => {
    const soundNotification: ISoundNotification = container.get(
      'SOUND_NOTIFICATION',
    );
    const media = soundNotification.create(soundName, 'setting');
    setState(media);
  }, []);
  return state;
}

const SoundSourceItem = (props: SoundItemProps) => {
  const { value } = props;
  return (
    <JuiTextWithEllipsis>
      {i18nP(`setting.notificationAndSounds.sounds.options.${value.id}`)}
    </JuiTextWithEllipsis>
  );
};

const SoundSourcePlayer = (props: SoundItemProps) => {
  const { value } = props;
  if ([RINGS_TYPE.Off, SOUNDS_TYPE.Off].includes(value.id)) {
    return null;
  }
  const media = useSound(value.id);
  return (
    <AudioPlayerButton
      media={media}
      actionIcon={{
        [JuiAudioStatus.PLAY]: 'speaker',
      }}
    />
  );
};
const SoundSourcePlayerRenderer = (props: SoundItemProps) => (
  <SoundSourcePlayer {...props} />
);

export { SoundSourceItem, SoundSourcePlayerRenderer };
