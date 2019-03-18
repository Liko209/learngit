/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiTooltip, {
  TooltipProps as MuiTooltipProps,
} from '@material-ui/core/Tooltip';
import styled, {
  css,
  createGlobalStyle,
} from '../../../foundation/styled-components';

type JuiTooltipProps = {
  placement?: string;
  show?: boolean;
} & MuiTooltipProps;

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

const tooltipColor = ({ theme }: any) => theme.palette['tooltip']['dark'];

const bottom = css`
  top: 0;
  left: 0;
  margin-top: ${-0.9 * baseSize}px;
  height: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-top-width: 0;
    border-color: transparent transparent ${tooltipColor} transparent;
  }
`;

const top = css`
  bottom: ${-baseSize}px;
  left: 0;
  margin-top: ${-0.9 * baseSize}px;
  width: ${3 * baseSize}px;
  height: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-color: ${tooltipColor} transparent transparent;
  }
`;

const right = css`
  top: 0;
  left: 0;
  margin-left: ${-0.8 * baseSize}px;
  height: ${2 * baseSize}px;
  width: ${baseSize}px;
  &::before {
    border-width: ${baseSize}px;
    border-left-width: 0;
    border-color: transparent ${tooltipColor} transparent transparent;
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
`;
export class JuiArrowTip extends React.PureComponent<JuiTooltipProps> {
  state = {
    arrowRef: null,
  };

  handleArrowRef = (node: any) => {
    this.setState({
      arrowRef: node,
    });
  }

  render() {
    const { title, children, placement = 'bottom', ...rest } = this.props;
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
            tooltipPlacementRight: 'tooltipPlacementRight',
            tooltipPlacementBottom: 'tooltipPlacementBottom',
            tooltipPlacementTop: 'tooltipPlacementTop',
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
        <GlobalToolTipStyle suppressMultiMountWarning={true} />
      </React.Fragment>
    );
  }
}
