/*
 * @Author: Spike.Yang
 * @Date: 2019-09-03 16:53:32
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { darken } from '@material-ui/core/styles/colorManipulator';
import styled from '../../foundation/styled-components';
import { spacing, palette } from '../../foundation/utils/styles';
import { JuiFabButton } from '../../components/Buttons';

type JuiEndAndAnswerProps = {
  ariaLabel?: string;
  handleClick?: () => void;
};

const StyledHangUpBtn = styled(JuiFabButton)`
  && {
    position: absolute;
    width: ${spacing(6)};
    height: ${spacing(6)};
    top: 0;
    left: 0;
  }
`;

const StyledAnswerBtn = styled(JuiFabButton)`
  && {
    position: absolute;
    width: ${spacing(10)};
    height: ${spacing(10)};
    right: 0;
    bottom: 0;
    z-index: 2;
  }
`;

const StyledWrapper = styled('div')`
  && {
    position: relative;
    width: ${spacing(12)};
    height: ${spacing(12)};

    &:hover ${StyledHangUpBtn}, &:active ${StyledHangUpBtn} {
      background-color: ${({ theme }) =>
        darken(palette('semantic', 'negative')({ theme }), 0.1)};
    }

    &:hover ${StyledAnswerBtn}, &:active ${StyledAnswerBtn} {
      background-color: ${({ theme }) =>
        darken(palette('semantic', 'positive')({ theme }), 0.1)};
    }
  }
`;

const JuiEndAndAnswer = React.memo((props: JuiEndAndAnswerProps) => {
  const { ariaLabel, handleClick } = props;

  return (
    <StyledWrapper
      onClick={handleClick}
      data-test-automation-id="telephony-end-answer-btn"
      aria-label={ariaLabel}
    >
      <StyledHangUpBtn
        color="semantic.negative"
        size="small"
        showShadow={false}
        iconName="hand_up"
      />
      <StyledAnswerBtn
        color="semantic.positive"
        size="medium"
        showShadow={false}
        iconName="answer"
      />
    </StyledWrapper>
  );
});

JuiEndAndAnswer.displayName = 'JuiEndAndAnswer';

export { JuiEndAndAnswer, JuiEndAndAnswerProps };
