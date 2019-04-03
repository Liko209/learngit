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
  End: React.ComponentType;
  KeypadActions: React.ComponentType[];
};

const StyledContainer = styled('div')`
  && {
    background-color: ${palette('common', 'white')};
    padding: ${spacing(10, 6, 6)};
    box-sizing: border-box;
    height: ${height(87)};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const StyledEnd = styled('div')`
  && {
    display: flex;
    justify-content: center;
  }
`;

const StyledKeypadActions = styled('div')`
  && {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
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
  state = {
    showHoverActions: false,
  };

  render() {
    const { End, KeypadActions } = this.props;
    return (
      <StyledContainer>
        <StyledKeypadActions>
          {KeypadActions.map((Action: React.ComponentType) => (
            <Action key={Action.displayName} />
          ))}
        </StyledKeypadActions>
        <StyledEnd>
          <End />
        </StyledEnd>
      </StyledContainer>
    );
  }
}

export { JuiContainer, JuiKeypadAction };
