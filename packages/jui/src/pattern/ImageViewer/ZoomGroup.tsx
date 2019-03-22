/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-3-1 10:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  height,
  width,
  grey,
  spacing,
  palette,
} from '../../foundation/utils/styles';

type JuiZoomGroupProps = {
  disabled?: boolean;
  ZoomIn: React.ReactNode;
  ZoomOut: React.ReactNode;
  ZoomReset: React.ReactNode;
  resetMode?: boolean;
  centerText: string;
  className?: string;
};

const StylesContain = styled.div`
  && {
    display: flex;
    align-items: center;
    background-color: ${palette('common', 'white')};
    height: ${({ theme }) => height(10)({ theme })};
    border-radius: ${({ theme }) => width(5)({ theme })};
    transition: box-shadow 0.3s ease-in;
    box-shadow: ${props => props.theme.shadows[1]};
    &:hover {
      box-shadow: ${props => props.theme.shadows[5]};
    }
    padding: ${spacing(0, 4)};
  }
`;

const StyledZoom = styled.div``;

const StyledReset = styled.div`
  && {
    padding-left: ${spacing(2)};
  }
`;

const StyledTextContain = styled.div`
  && {
    width: ${({ theme }) => width(8.5)({ theme })};
    padding: ${spacing(0, 3)};
    width: ${width(8.5)};
    color: ${grey('900')};
    font-size: ${spacing(3.5)};
    text-align: center;
  }
`;

class JuiFabGroup extends PureComponent<JuiZoomGroupProps> {
  render() {
    const {
      ZoomIn,
      ZoomOut,
      ZoomReset: Reset,
      centerText,
      className,
    } = this.props;
    return (
      <StylesContain className={className}>
        <StyledZoom>{ZoomOut}</StyledZoom>
        <StyledTextContain>{centerText}</StyledTextContain>
        <StyledZoom>{ZoomIn}</StyledZoom>
        <StyledReset>{Reset}</StyledReset>
      </StylesContain>
    );
  }
}

export { JuiFabGroup, JuiZoomGroupProps };
