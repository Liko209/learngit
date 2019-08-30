/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-29 14:10:15
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import {
  JuiTranscriptionPreview,
  JuiTranscriptionDetails,
} from '../Transcription';
import {
  JuiExpansionPanel,
  JuiExpansionPanelSummary,
  JuiExpansionPanelDetails,
} from 'rcui/components/ExpansionPanel';

const knobs = {
  isLoading: () => boolean('isLoading', false),
  showPreivew: () => boolean('showPreivew', true),
  transcription: () =>
    text(
      'transcription',
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
  malesuada lacus ex, sit amet blandit leo lobortis eget.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.`,
    ),
};

storiesOf('Pattern/Voicemail', module).add('VoicemailItem', () => (
  <JuiExpansionPanel>
    <JuiExpansionPanelSummary>
      <JuiTranscriptionPreview
        isLoading={knobs.isLoading()}
        showPreivew={knobs.showPreivew()}
        transcription={knobs.transcription()}
      />
    </JuiExpansionPanelSummary>
    <JuiExpansionPanelDetails>
      <JuiTranscriptionDetails transcription={knobs.transcription()} />
    </JuiExpansionPanelDetails>
  </JuiExpansionPanel>
));
