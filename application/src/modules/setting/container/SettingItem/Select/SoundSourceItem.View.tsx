/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-07-23 11:08:47
 * Copyright Â© RingCentral. All rights reserved.
 */
import React, { useEffect, useState } from 'react';
import { i18nP } from '@/utils/i18nT';
import { AudioPlayerButton } from '@/modules/media/container/AudioPlayerButton';
import { JuiTextWithEllipsis } from 'jui/components/Text/TextWithEllipsis';
import { JuiAudioStatus } from 'jui/components/AudioPlayer';
import { container } from 'framework/ioc';
import { ISoundNotification, Sounds } from '@/modules/notification/interface';
import { IMedia } from '@/interface/media';
import { AUDIO_SOUNDS_INFO, RINGS_TYPE, SOUNDS_TYPE } from 'sdk/module/profile';
import { useHotKey } from 'jui/hoc/HotKeys';
import { useTranslation } from 'react-i18next';
import { SettingStore } from '../../../store';

type SoundItemProps = {
  value: AUDIO_SOUNDS_INFO;
};

function useSound(soundName: Sounds) {
  const [state, setState] = useState<IMedia | undefined>(undefined);
  useEffect(() => {
    const soundNotification: ISoundNotification = container.get(
      'SOUND_NOTIFICATION',
    );
    const settingStore: SettingStore = container.get(SettingStore);
    const trackId = settingStore.mediaTrackIds.setting;

    const media = soundNotification.create(soundName, {
      trackId,
      outputDevices: null,
    });
    setState(media);
    return () => {
      media && media.stop();
    };
  }, []);
  return state;
}

const SoundSourceItem = (props: SoundItemProps) => {
  const { value } = props;
  const key = value.id.split('.')[0];
  return (
    <JuiTextWithEllipsis>
      {i18nP(`setting.notificationAndSounds.sounds.options.${key}`)}
    </JuiTextWithEllipsis>
  );
};

const SoundSourcePlayer = (props: SoundItemProps) => {
  const { value } = props;
  if (
    [RINGS_TYPE.Off, SOUNDS_TYPE.Off, SOUNDS_TYPE.Default].includes(value.id)
  ) {
    return null;
  }
  const soundName = value.id;
  const media = useSound(soundName);
  useHotKey(
    {
      key: 'right',
      callback: e => {
        const el = e.srcElement as HTMLElement;
        if (!el) {
          return;
        }
        const attr = 'data-sound-type';
        const player = el.querySelector(`[${attr}]`);
        if (player) {
          const val = player.getAttribute(attr);
          if (val === soundName && media) {
            media.stop();
            media.play();
          }
        }
      },
    },
    [media],
  );
  const { t } = useTranslation();
  return (
    <div data-sound-type={soundName} aria-label={t('setting.playSound')}>
      <AudioPlayerButton
        media={media}
        actionIcon={{
          [JuiAudioStatus.PLAY]: 'speaker',
        }}
      />
    </div>
  );
};
const SoundSourcePlayerRenderer = (props: SoundItemProps) => (
  <SoundSourcePlayer {...props} />
);

export { SoundSourceItem, SoundSourcePlayerRenderer };
