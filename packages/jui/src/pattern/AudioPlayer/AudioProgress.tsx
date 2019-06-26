/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import moment from 'moment';
import { RuiSlider } from 'rcui/components/Forms';
import styled from '../../foundation/styled-components';
import { width, spacing, palette, typography } from '../../foundation/utils';
import { JuiAudioMode, JuiAudioProgressProps } from './types';

const StyledClock = styled.span`
  ${typography('caption1')};
  color: ${palette('grey', '500')};
`;

const StyledSlider = styled(RuiSlider)`
  && {
    margin: ${spacing(0, 4)};
    width: ${width(30)};
  }

  > div > div {
    transition: none;
  }
`;

const formatTime = (seconds: number): string =>
  moment()
    .minute(0)
    .second(seconds)
    .format('mm:ss');

const JuiAudioProgress = ({
  mode = JuiAudioMode.FULL,
  value = 0,
  duration = 0,
  onChange,
  onDragStart,
  onDragEnd,
}: JuiAudioProgressProps) => {
  const isMiniMode = Object.is(mode, JuiAudioMode.MINI);
  const currentTime = Math.min(value, duration);
  const elProgressClock = (
    <StyledClock data-test-automation-id="audio-end-time">
      {formatTime(duration)}
    </StyledClock>
  );

  if (isMiniMode) {
    return elProgressClock;
  }

  return (
    <Fragment>
      <StyledClock data-test-automation-id="audio-current-time">
        {formatTime(currentTime)}
      </StyledClock>
      <StyledSlider
        max={duration}
        value={value}
        onChange={onChange}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
      {elProgressClock}
    </Fragment>
  );
};

export { JuiAudioProgress };
