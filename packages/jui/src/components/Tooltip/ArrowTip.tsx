/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiTooltip, {
  TooltipProps as MuiTooltipProps,
} from '@material-ui/core/Tooltip';
import styled, { css } from '../../foundation/styled-components';
import { palette } from '../../foundation/utils/styles';

type JuiTooltipProps = {
  placement?: string;
} & MuiTooltipProps;

const TooltipArrow = styled.span<JuiTooltipProps>`
  position: absolute;
  font-size: 7px;
  width: 3em;
  height: 3em;
   &::before {
     content: "";
     margin: auto;
     display: block;
     width: 0;
     height: 0;
     border-style: solid;
   }
   ${({ placement }) => arrowStyles[placement!]}
`;
const bottom = css`
  top: 0;
  left: 0;
  margin-top: -0.9em;
  width: 3em;
  height: 1em;
  &::before {
    border-width: 0 1em 1em 1em;
    border-color: transparent transparent ${palette(
      'tooltip',
      'dark',
    )} transparent;
  },
`;
const top = css`
  bottom: -1em;
  left: 0;
  margin-top: -0.9em;
  width: 3em;
  height: 1em;
  &::before {
    border-width: 1em 1em 1em;
    border-color: ${palette('tooltip', 'dark')} transparent transparent;
  },
`;

const right = css`
  left: 0;
  top: 0;
  margin-left: -0.8em;
  height: 1.8em;
  width: 1em;
  &::before {
    border-width: 0.6em 0.6em 0.6em 0;
    border-color: transparent ${palette(
      'tooltip',
      'dark',
    )} transparent transparent;
  },
`;
const left = css`
  left: 0;
  margin-left: 0em;
  height: 0em;
  width: 23em;
  &::before {
    border-width: 1em 0 1em 1em;
    border-color: transparent  transparent transparent ${palette(
      'tooltip',
      'dark',
    )};
  },
`;
const arrowStyles = {
  bottom,
  top,
  right,
  left,
};
class JuiArrowTip extends React.Component<JuiTooltipProps> {
  static dependencies = [MuiTooltip];

  state = {
    arrowRef: null,
  };
  handleArrowRef = (ele: HTMLSpanElement) => {
    this.setState({
      arrowRef: ele,
    });
  }
  render() {
    const { title, children, placement, ...rest } = this.props;
    return (
      <MuiTooltip
        {...rest}
        title={
          <React.Fragment>
            {title}
            <TooltipArrow placement={placement} ref={this.handleArrowRef} />
          </React.Fragment>
        }
        classes={{
          popper: 'popper',
        }}
        PopperProps={{
          popperOptions: {
            modifiers: {
              arrow: {
                enabled: Boolean(this.state.arrowRef),
                element: this.state.arrowRef,
              },
            },
          },
        }}
      >
        {children}
      </MuiTooltip>
    );
  }
}

export { JuiArrowTip };
