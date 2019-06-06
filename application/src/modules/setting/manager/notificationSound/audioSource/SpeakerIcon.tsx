import React from 'react';
import { RuiIconography } from 'rcui/components/Iconography';
import { RuiSliderChildProps } from 'rcui/components/Forms/Slider';

const SpeakerMuteIcon = (props: RuiSliderChildProps) => (
  <RuiIconography
    icon="speaker-mute"
    iconColor={props.color}
    iconSize={props.size}
  />
);

const SpeakerIcon = (props: RuiSliderChildProps) => (
  <RuiIconography
    icon="speaker"
    iconColor={props.color}
    iconSize={props.size}
  />
);

export { SpeakerMuteIcon, SpeakerIcon };
