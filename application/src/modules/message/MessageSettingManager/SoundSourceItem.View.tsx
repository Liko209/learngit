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

type SoundItemProps = {
  value: Sounds;
};

const useSound = (soundName: Sounds) => {
  const [state, setState] = useState<IMedia>();
  useEffect(() => {
    const soundNotification: ISoundNotification = container.get(
      ISoundNotification,
    );
    setState(soundNotification.create(soundName, 'setting'));
  }, []);
  return state;
};

const SoundSourceItem = (props: SoundItemProps) => {
  const { value } = props;
  return (
    <JuiTextWithEllipsis>
      {i18nP(`setting.notificationAndSounds.sounds.options.${value}`)}
    </JuiTextWithEllipsis>
  );
};

const SoundSourcePlayer = (props: SoundItemProps) => {
  const { value } = props;
  const media = useSound(value);
  return (
    <AudioPlayerButton
      media={media}
      actionIcon={{
        [JuiAudioStatus.PLAY]: 'speaker',
      }}
    />
  );
};

export { SoundSourceItem, SoundSourcePlayer };
