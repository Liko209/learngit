/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';
import { JuiIconButton } from '../../components/Buttons';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { JuiAudioStatus, JuiAudioActionProps } from './types';

const StyledIconButton = styled(JuiIconButton)`
  && {
    margin-right: ${spacing(2)};
  }
`;

const StyledPlayerLoading = styled(RuiCircularProgress)`
  &&&& {
    box-sizing: border-box;
    margin-right: ${spacing(2)};
    padding: ${spacing(2.5)};
  }
`;

const JuiAudioAction = ({
  color,
  status,
  onAction,
  tooltip,
  label,
}: JuiAudioActionProps) => {
  if (status === JuiAudioStatus.LOADING) {
    return (
      <StyledPlayerLoading
        data-test-automation-id="audio-loading-btn"
        size={40}
      />
    );
  }

  const isReload = Object.is(status, JuiAudioStatus.RELOAD);
  const iconTitle = isReload ? 'refresh' : status;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(status);
  };

  return (
    <StyledIconButton
      onClick={onClick}
      data-test-automation-id={`audio-${iconTitle}-btn`}
      color={color}
      tooltipTitle={tooltip}
      ariaLabel={label}
    >
      {iconTitle}
    </StyledIconButton>
  );
};

export { JuiAudioAction };
