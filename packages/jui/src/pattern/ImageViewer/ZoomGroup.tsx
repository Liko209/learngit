/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-3-1 10:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { height, width, grey, spacing } from '../../foundation/utils/styles';

type JuiFabGroupProps = {
  disabled?: boolean;
  ZoomIn: React.ReactNode;
  ZoomOut: React.ReactNode;
  centerText: string;
};
const StylesButtonContain = styled.div`
  && {
    display: flex;
    align-items: center;
    height: ${({ theme }) => height(10)({ theme })};
    width: ${({ theme }) => width(24.5)({ theme })};
    border-radius: ${({ theme }) => width(5)({ theme })};
    transition: box-shadow 0.3s ease-in;
    box-shadow: ${props => props.theme.shadows[1]};
    &:hover {
      box-shadow: ${props => props.theme.shadows[5]};
    }
    padding: ${spacing(0, 4)};
  }
`;
const StyledZoom = styled.div`
  && {
    svg {
      font-size: ${spacing(5)};
      color: ${grey('500')};
    }
  }
`;

const StyledTextContain = styled.div`
  && {
    padding: ${spacing(0, 3)};
    color: ${grey('900')};
    font-size: ${spacing(3.5)};
  }
`;

class JuiFabGroup extends PureComponent<JuiFabGroupProps> {
  render() {
    const { ZoomIn, ZoomOut, centerText } = this.props;
    return (
      <StylesButtonContain>
        <StyledZoom>{ZoomIn}</StyledZoom>
        <StyledTextContain>{centerText}</StyledTextContain>
        <StyledZoom>{ZoomOut}</StyledZoom>
      </StylesButtonContain>
    );
  }
}

export { JuiFabGroup, JuiFabGroupProps };
