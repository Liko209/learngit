/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-21 22:54:15
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ReactElement } from 'react';
import MuiTooltip from '@material-ui/core/Tooltip';
import styled, {
  css,
  createGlobalStyle,
  withTheme,
} from '../../foundation/styled-components';
import { Theme } from '../../foundation/styles';

type RuiTooltipProps = {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  show?: boolean;
  title: string;
  children: ReactElement;
  theme: Theme;
};

const baseSize = 7;

const TooltipArrow = styled.span`
  position: absolute;
  width: ${3 * baseSize}px;
  height: ${3 * baseSize}px;
  &::before {
    content: '';
    margin: auto;
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
  }
`;

const tooltipColor = ({ theme }: { theme: Theme }) =>
  theme.palette['tooltip']['main'];

const bottom = css`
  top: 0;
  left: 0;
  margin-top: ${-0.9 * baseSize}px;
  width: ${3 * baseSize}px;
  height: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-top-width: 0;
    border-color: transparent transparent ${tooltipColor} transparent;
  }
`;

const top = css`
  bottom: 0;
  left: 0;
  margin-bottom: ${-0.9 * baseSize}px;
  width: ${3 * baseSize}px;
  height: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-bottom-width: 0;
    border-color: ${tooltipColor} transparent transparent;
  }
`;

const right = css`
  left: 0;
  margin-left: ${-0.9 * baseSize}px;
  height: ${2 * baseSize}px;
  width: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-left-width: 0;
    border-color: transparent ${tooltipColor} transparent transparent;
  }
`;

const left = css`
  right: 0;
  margin-right: ${-0.8 * baseSize}px;
  height: ${2 * baseSize}px;
  width: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-right-width: 0;
    border-color: transparent transparent transparent ${tooltipColor};
  }
`;

const GlobalToolTipStyle = createGlobalStyle`
  .popper[x-placement='right'] ${TooltipArrow}{
    margin: 0 2px;
    ${right}
  }

  .popper[x-placement='top'] ${TooltipArrow}{
    margin: 16px 0;
    ${top}
  }

  .popper[x-placement='bottom'] ${TooltipArrow}{
    margin: 12px 0;
    ${bottom}
  }

  .popper[x-placement='left'] ${TooltipArrow}{
    margin: 0 2px;
    ${left}
  }
`;
class Tooltip extends React.PureComponent<RuiTooltipProps> {
  state = {
    arrowRef: null,
  };

  handleArrowRef = (node: any) => {
    this.setState({
      arrowRef: node,
    });
  }

  render() {
    const {
      title,
      children,
      placement = 'bottom',
      theme,
      ...rest
    } = this.props;
    const { arrowRef } = this.state;
    return (
      <React.Fragment>
        <MuiTooltip
          {...rest}
          disableFocusListener={true}
          placement={placement}
          title={
            <React.Fragment>
              {title}
              <TooltipArrow ref={this.handleArrowRef} />
            </React.Fragment>
          }
          classes={{
            popper: 'popper',
          }}
          PopperProps={{
            popperOptions: {
              modifiers: {
                arrow: {
                  enabled: Boolean(arrowRef),
                  element: arrowRef,
                },
              },
            },
          }}
        >
          {children}
        </MuiTooltip>
        <GlobalToolTipStyle theme={theme} />
      </React.Fragment>
    );
  }
}

const RuiTooltip = withTheme(Tooltip);

export { RuiTooltipProps, RuiTooltip };
