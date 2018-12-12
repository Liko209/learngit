/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { CSSProperties, PureComponent } from 'react';
import ReactDOM from 'react-dom';

import MuiTypography from '@material-ui/core/Typography';
import { JuiArrowTip } from '../../components/Tooltip/ArrowTip';

import styled from '../../foundation/styled-components';
import { isTextOverflow, spacing, typography } from '../../foundation/utils';

const StyledTypography = styled(MuiTypography)`
  && {
    flex: 1;
    padding: ${spacing(0, 3, 0, 2)};
    ${typography('body2')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
    z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  }
`;

type ItemTextProps = {
  style?: CSSProperties;
  disableTooltip?: boolean;
};

type ItemTextStates = {
  tipOpen: boolean;
};

class ConversationListItemText extends PureComponent<
  ItemTextProps,
  ItemTextStates
> {
  textEl?: HTMLElement;
  textRef: React.RefObject<any>;

  constructor(props: ItemTextProps) {
    super(props);
    this.state = { tipOpen: false };
    this.textRef = React.createRef();
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
  }

  render() {
    const { tipOpen } = this.state;

    return this.props.disableTooltip ? (
      <StyledTypography {...this.props}>{this.props.children}</StyledTypography>
    ) : (
      <JuiArrowTip
        title={this.props.children}
        disableFocusListener={false}
        disableHoverListener={false}
        disableTouchListener={false}
        open={tipOpen}
      >
        <StyledTypography
          {...this.props}
          ref={this.textRef}
          onMouseOver={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
        >
          {this.props.children}
        </StyledTypography>
      </JuiArrowTip>
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

export default ConversationListItemText;
export { ItemTextProps, ConversationListItemText };
