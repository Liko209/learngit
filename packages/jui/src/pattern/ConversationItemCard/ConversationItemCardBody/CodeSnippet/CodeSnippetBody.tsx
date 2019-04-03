/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-16 13:07:04
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../../foundation/styled-components';
import { spacing } from '../../../../foundation/utils';
import React from 'react';
import { JuiLozengeButton } from '../../../../components/Buttons/LozengeButton';

const StyledContainer = styled('div')`
  position: relative;
`;

const StyledActionBarContainer = styled('div')`
  position: absolute;
  bottom: ${spacing(2)};
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: ${({ theme }) => `${theme.zIndex.codeEditor + 1}`};
`;

const StyledCodeEditorWrapper = styled('div')`
  position: relative;
  z-index: ${({ theme }) => `${theme.zIndex.codeEditor}`};
`;

const StyledButton = styled(JuiLozengeButton)`
  && {
    margin: ${spacing(0, 1.5)};
  }
`;

type hoverAction = {
  text: string;
  handler: React.MouseEventHandler;
};

type JuiCodeSnippetBodyProps = {
  hoverActions: hoverAction[];
};

class JuiCodeSnippetBody extends React.PureComponent<JuiCodeSnippetBodyProps> {
  render() {
    const { children, hoverActions } = this.props;
    return (
      <StyledContainer>
        <StyledCodeEditorWrapper>{children}</StyledCodeEditorWrapper>
        {hoverActions && (
          <StyledActionBarContainer>
            {hoverActions.map((action: hoverAction) => (
              <StyledButton key={action.text} onClick={action.handler}>
                {action.text}
              </StyledButton>
            ))}
          </StyledActionBarContainer>
        )}
      </StyledContainer>
    );
  }
}

export { JuiCodeSnippetBody };
