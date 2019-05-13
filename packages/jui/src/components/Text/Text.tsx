/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { CSSProperties, PureComponent } from 'react';
import ReactDOM from 'react-dom';

import MuiTypography, { TypographyProps } from '@material-ui/core/Typography';
import { RuiTooltip, RuiTooltipProps } from 'rcui/components/Tooltip';
import styled from '../../foundation/styled-components';
import { isTextOverflow } from '../../foundation/utils';

const StyledTypography = styled(MuiTypography)`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
    &::before,
    &::after {
      content: '';
      display: block;
      width: 0;
      height: 0;
    }
  }
`;

type JuiTextProps = {
  style?: CSSProperties;
  disableTooltip?: boolean;
  tooltipProps?: RuiTooltipProps;
  tooltipTitle?: React.ReactNode;
} & TypographyProps;

type TextStates = {
  tipOpen: boolean;
};

class JuiText extends PureComponent<JuiTextProps, TextStates> {
  textEl?: HTMLElement;
  textRef: React.RefObject<any>;

  constructor(props: JuiTextProps) {
    super(props);
    this.state = { tipOpen: false };
    this.textRef = React.createRef();
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
  }

  render() {
    const { tipOpen } = this.state;

    const {
      disableTooltip,
      tooltipProps,
      tooltipTitle,
      children,
      ...rest
    } = this.props;
    return disableTooltip ? (
      <StyledTypography {...rest}>{children}</StyledTypography>
    ) : (
      <RuiTooltip
        title={tooltipTitle || children}
        disableFocusListener={false}
        disableHoverListener={false}
        disableTouchListener={false}
        open={tipOpen}
        {...tooltipProps}
      >
        <StyledTypography
          {...rest}
          ref={this.textRef}
          onMouseOver={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
        >
          {children}
        </StyledTypography>
      </RuiTooltip>
    );
  }

  componentDidMount() {
    if (!this.props.disableTooltip) {
      const textEl = ReactDOM.findDOMNode(this.textRef.current);

      if (textEl && textEl instanceof HTMLElement) {
        this.textEl = textEl;
      }
    }
  }

  private _handleMouseEnter() {
    if (!this.textEl) return;

    this.setState({
      tipOpen: isTextOverflow(this.textEl),
    });
  }

  private _handleMouseLeave() {
    this.setState({ tipOpen: false });
  }
}

export default JuiText;
export { JuiTextProps, JuiText };
