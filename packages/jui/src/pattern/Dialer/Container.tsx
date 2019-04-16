/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  palette,
  height,
  width,
  grey,
  typography,
} from '../../foundation/utils/styles';

type Props = {
  removeMargin: boolean;
  End: React.ComponentType;
  KeypadActions: React.ComponentType[];
};

const StyledContainer = styled('div')`
  && {
    background-color: ${palette('common', 'white')};
    padding: ${spacing(0, 6, 6)};
    box-sizing: border-box;
    height: ${height(99)};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const StyledEnd = styled('div')`
  && {
    align-self: center;
  }
`;

const StyledKeypadActionsContainer = styled('div')`
  && {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const StyledKeypadActions = styled.div<{ removeMargin: boolean }>`
  && {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: ${({ removeMargin, theme }) =>
    removeMargin ? spacing(-5)({ theme }) : 0};
  }
`;

const JuiKeypadAction = styled('div')`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: ${width(16)};
    margin-bottom: ${spacing(5)};
    & > span {
      color: ${grey('700')};
      ${typography('caption1')};
      &.disabled {
        color: ${({ theme }) =>
    palette('action', 'disabledBackground')({ theme })};
      }
    }
  }
`;

class JuiContainer extends PureComponent<Props> {
  static defaultProps = {
    removeMargin: true,
  };

  state = {
    showHoverActions: false,
  };

  render() {
    const { End, KeypadActions, removeMargin } = this.props;
    return (
      <StyledContainer>
        <StyledKeypadActionsContainer>
          <StyledKeypadActions removeMargin={removeMargin}>
            {KeypadActions.map((Action: React.ComponentType) => (
              <Action key={Action.displayName} />
            ))}
          </StyledKeypadActions>
        </StyledKeypadActionsContainer>
        <StyledEnd>
          <End />
        </StyledEnd>
      </StyledContainer>
    );
  }
}

const KeypadHeaderContainer = styled.div`
      height: 100%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ${spacing(0, 9, 1, 5)};
  `;

export { JuiContainer, JuiKeypadAction, KeypadHeaderContainer };
