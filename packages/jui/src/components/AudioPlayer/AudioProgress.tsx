/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-22 16:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Fragment } from 'react';
import moment from 'moment';
import { RuiSlider } from 'rcui/components/Forms';
import styled from '../../foundation/styled-components';
import { width, spacing, palette, typography } from '../../foundation/utils';
import { JuiAudioMode, JuiAudioStatus, JuiAudioProgressProps } from './types';

const StyledClock = styled.span`
  ${typography('caption1')};
  color: ${palette('grey', '600')};
`;

const StyledSlider = styled(RuiSlider)`
  && {
    margin: ${spacing(0, 2.5)};
    width: ${width(22.5)};
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
  status,
  onChange,
  onDragStart,
  onDragEnd,
}: JuiAudioProgressProps) => {
  if (Object.is(mode, JuiAudioMode.TINY)) {
    return null;
  }

  const currentTime = Math.min(value, duration);

  const elProgressClock = (
    <StyledClock data-test-automation-id="audio-current-time">
      {formatTime(currentTime)}
    </StyledClock>
  );

  const elDurationsClock = (
    <StyledClock data-test-automation-id="audio-end-time">
      {formatTime(duration)}
    </StyledClock>
  );

  if (Object.is(mode, JuiAudioMode.MINI)) {
    return status === JuiAudioStatus.PAUSE ? elProgressClock : elDurationsClock;
  }

  return (
    <Fragment>
      {elProgressClock}
      <StyledSlider
        max={duration}
        value={value}
        onChange={onChange}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        valueLabelDisplay={'off'}
      />
      {elDurationsClock}
    </Fragment>
  );
};

export { JuiAudioProgress };
