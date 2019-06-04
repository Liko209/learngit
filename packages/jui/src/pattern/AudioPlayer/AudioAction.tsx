/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'src/foundation/styled-components';
import { spacing } from 'src/foundation/utils';
import { JuiIconButton } from 'src/components/Buttons';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { JuiAudioStatus, JuiAudioActionProps } from './types';

const StyledIconButton = styled(JuiIconButton)`
  && {
    margin-right: ${spacing(2)};
  }
`;

const StyledPlayerLoading = styled(RuiCircularProgress)`
  &&&& {
    margin-right: ${spacing(2)};
    padding: ${spacing(2.5)};
  }
`;

const JuiAudioAction = ({
  color,
  status,
  onAction,
  tooltip,
}: JuiAudioActionProps) => {
  if (status === JuiAudioStatus.LOADING) {
    return <StyledPlayerLoading size={40} />;
  }

  const isReload = Object.is(status, JuiAudioStatus.RELOAD);
  const iconTitle = isReload ? 'refresh' : status;

  const onClick = () => onAction(status);

  return (
    <StyledIconButton onClick={onClick} color={color} tooltipTitle={tooltip}>
      {iconTitle}
    </StyledIconButton>
  );
};

export { JuiAudioAction };
