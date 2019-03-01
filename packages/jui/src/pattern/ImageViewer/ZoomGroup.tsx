/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-3-1 10:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { height, width, grey, spacing } from '../../foundation/utils/styles';

type JuiZoomGroupProps = {
  disabled?: boolean;
  ZoomIn: React.ReactNode;
  ZoomOut: React.ReactNode;
  centerText: string;
};
const StylesContain = styled.div`
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

class JuiFabGroup extends PureComponent<JuiZoomGroupProps> {
  render() {
    const { ZoomIn, ZoomOut, centerText } = this.props;
    return (
      <StylesContain>
        <StyledZoom>{ZoomIn}</StyledZoom>
        <StyledTextContain>{centerText}</StyledTextContain>
        <StyledZoom>{ZoomOut}</StyledZoom>
      </StylesContain>
    );
  }
}

export { JuiFabGroup, JuiZoomGroupProps };
