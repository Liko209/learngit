/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-22 16:30:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';
import { JuiIconButton } from '../Buttons';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { JuiAudioStatus, JuiAudioActionProps, JuiAudioMode } from './types';

const StyledPlayerLoading = styled(RuiCircularProgress)`
  &&&& {
    box-sizing: border-box;
    padding: ${spacing(2.5)};
  }
`;

const StyledAudioAction = styled.div<{ mode: JuiAudioMode }>`
  padding-right: ${({ mode }) => (mode === JuiAudioMode.TINY ? 0 : spacing(2))};
`;

const JuiAudioActionView = ({
  color,
  status,
  onAction,
  tooltip,
  label,
  actionIcon,
}: JuiAudioActionProps) => {
  let iconTitle = '';

  if (Object.is(status, JuiAudioStatus.PLAY)) {
    iconTitle =
      (actionIcon && actionIcon[JuiAudioStatus.PLAY]) || JuiAudioStatus.PLAY;
  } else if (Object.is(status, JuiAudioStatus.PAUSE)) {
    iconTitle =
      (actionIcon && actionIcon[JuiAudioStatus.PAUSE]) || JuiAudioStatus.PAUSE;
  } else if (Object.is(status, JuiAudioStatus.RELOAD)) {
    iconTitle = (actionIcon && actionIcon[JuiAudioStatus.RELOAD]) || 'refresh';
  } else if (Object.is(status, JuiAudioStatus.LOADING)) {
    return (
      <StyledPlayerLoading
        data-test-automation-id="audio-loading-btn"
        size={40}
      />
    );
  }
  const [deferRenderEffect, setDeferRenderEffect] = useState(true);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(status);
  };

  const onActiveRenderEffect = () => {
    if (deferRenderEffect) setDeferRenderEffect(false);
  };

  return (
    <JuiIconButton
      onClick={onClick}
      data-test-automation-id={`audio-${iconTitle}-btn`}
      color={color}
      tooltipTitle={tooltip}
      ariaLabel={label}
      onMouseEnter={onActiveRenderEffect}
      onFocus={onActiveRenderEffect}
      disableToolTip={deferRenderEffect}
      disableTouchRipple={deferRenderEffect}
    >
      {iconTitle}
    </JuiIconButton>
  );
};

const JuiAudioAction = (props: JuiAudioActionProps) => (
  <StyledAudioAction mode={props.mode}>
    <JuiAudioActionView {...props} />
  </StyledAudioAction>
);

export { JuiAudioAction };
