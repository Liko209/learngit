/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-07-23 11:08:47
 * Copyright Â© RingCentral. All rights reserved.
 */
import React from 'react';
import { RINGS_LIST, SOUNDS_LIST } from 'sdk/module/profile';
import { i18nP } from '@/utils/i18nT';
import { AudioPlayerButton } from '@/modules/media/container/AudioPlayerButton';
import { JuiTextWithEllipsis } from 'jui/components/Text/TextWithEllipsis';

type SoundItemProps = {
  value: RINGS_LIST | SOUNDS_LIST;
};

const SoundSourceItem = (props: SoundItemProps) => {
  const { value } = props;
  return (
    <JuiTextWithEllipsis>
      {i18nP(`setting.notificationAndSounds.sounds.options.${value}`)}
    </JuiTextWithEllipsis>
  );
};
const SoundSourcePlayer = () => {
  return <AudioPlayerButton />;
};
export { SoundSourceItem, SoundSourcePlayer };
