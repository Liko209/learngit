/*
 * @Author: wayne.zhou
 * @Date: 2019-05-08 13:50:59
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiTooltip, {
  TooltipProps as MuiTooltipProps,
} from '@material-ui/core/Tooltip';
import styled, {
  css,
  createGlobalStyle,
} from '../../foundation/styled-components';

const placementTopMargin = '16px 0';
const placementBottomMargin = '12px 0';
const placementLeftMargin = '0 2px';
const placementRightMargin = '0 2px';

type RuiTooltipProps = {
  placement?: string;
  tooltipForceHide?: boolean;
} & MuiTooltipProps;

const baseSize = 7;

const TooltipArrow = styled.span`
  position: absolute;
  width: ${3 * baseSize}px;
  height: ${3 * baseSize}px;
  &::before {
    content: '';
    color: transparent;
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
    margin: ${placementRightMargin};
    ${right}
  }

  .popper[x-placement='top'] ${TooltipArrow}{
    margin: ${placementTopMargin};
    ${top}
  }

  .popper[x-placement='bottom'] ${TooltipArrow}{
    margin: ${placementBottomMargin};
    ${bottom}
  }

  .popper[x-placement='left'] ${TooltipArrow}{
    margin: ${placementLeftMargin};
    ${left}
  }
`;
export class RuiTooltip extends React.PureComponent<RuiTooltipProps> {
  state = {
    arrowRef: null,
    open: false,
  };

  handleArrowRef = (node: any) => {
    this.setState({
      arrowRef: node,
    });
  }

  handleTooltipClose = () => {
    this.setState({ open: false });
  }

  handleTooltipOpen = () => {
    this.setState({ open: true });
  }

  componentDidUpdate() {
    if (this.props.tooltipForceHide === true) {
      this.setState({ open: !this.props.tooltipForceHide });
    }
  }

  render() {
    const {
      title,
      children,
      placement = 'bottom',
      tooltipForceHide,
      open: propOpen,
      ...rest
    } = this.props;
    const { arrowRef, open: stateOpen } = this.state;
    const open = propOpen !== undefined ? propOpen : stateOpen;
    return (
      <React.Fragment>
        <MuiTooltip
          {...rest}
          open={open}
          onClose={this.handleTooltipClose}
          onOpen={this.handleTooltipOpen}
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
        <GlobalToolTipStyle suppressMultiMountWarning={true} />
      </React.Fragment>
    );
  }
}

export { RuiTooltipProps };
