/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiAudioPlayer } from '../AudioPlayer';
import { JuiAudioMode } from '../types';

const actionTips = {
  play: 'play',
  pause: 'pause',
  reload: 'reload',
};

const actionLabels = {
  play: 'play voicemail',
  pause: 'pause voicemail',
  reload: 'reload voicemail',
};

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiAudioPlayer, { inline: true }))
  .add('AudioPlayer', () => {
    return (
      <dl>
        <dt>mode mini</dt>
        <dd>
          <JuiAudioPlayer
            src="https://mfile.bandari.net/mc-U52f5t5wDSe/Bandari/05Mist/04.Bandari.Net_Morning.mp3"
            mode={JuiAudioMode.MINI}
            duration={188}
            startTime={0}
            actionTips={actionTips}
            actionLabels={actionLabels}
          />
        </dd>
        <dt>mode full</dt>
        <dd>
          <JuiAudioPlayer
            src="https://mfile.bandari.net/mc-U52f5t5wDSe/Bandari/05Mist/04.Bandari.Net_Morning.mp3"
            duration={188}
            startTime={30}
            actionTips={actionTips}
            actionLabels={actionLabels}
          />
        </dd>
        <dt>highlight display</dt>
        <dd>
          <JuiAudioPlayer
            isHighlight={true}
            src="https://mfile.bandari.net/mc-U52f5t5wDSe/Bandari/05Mist/04.Bandari.Net_Morning.mp3"
            duration={188}
            startTime={60}
            actionTips={actionTips}
            actionLabels={actionLabels}
          />
        </dd>
        <dt>reload display</dt>
        <dd>
          <JuiAudioPlayer
            src="http://www.invalid.com/inexistence.mp3"
            duration={188}
            startTime={90}
            actionTips={actionTips}
            actionLabels={actionLabels}
          />
        </dd>
      </dl>
    );
  });
