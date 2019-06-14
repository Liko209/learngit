/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-29 14:10:15
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { JuiTranscriptionPreview } from '../Transcription';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

const knobs = {
  isLoading: () => boolean('isLoading', true),
  showPreivew: () => boolean('showPreivew', true),
  transcription: () => text('transcription', 'transcriptiontranscriptiontranscriptiontranscriptiontranscriptiontranscription'),
};

storiesOf('Pattern/Voicemail', module)
  .addDecorator(withInfoDecorator(JuiTranscriptionPreview, { inline: true }))
  .add('Transcription', () => (
    <div style={{ height: '64px', padding: '16px 0' }}>
      <JuiTranscriptionPreview
        isLoading={knobs.isLoading()}
        showPreivew={knobs.showPreivew()}
        transcription={knobs.transcription()}
      />
    </div>
  ))
  ;
