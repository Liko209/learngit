import React, { Component, CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import { isTextOverflow } from '../../utils';

const StyledTypography = styled(Typography)`
  && {
    flex: 1;
    padding: 0 8px;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: inherit;
  }
`;

type ItemTextProps = {
  style?: CSSProperties;
};

type ItemTextStates = {
  disableTooltip: boolean;
};

class ConversationListItemText extends Component<ItemTextProps, ItemTextStates> {
  textRef: React.RefObject<any>;

  constructor(props: ItemTextProps) {
    super(props);
    this.state = { disableTooltip: true };
    this.textRef = React.createRef();
    this._handleMouseOver = this._handleMouseOver.bind(this);
  }

  render() {
    const { disableTooltip } = this.state;

    return (
      <Tooltip
        title={this.props.children}
        disableFocusListener={disableTooltip}
        disableHoverListener={disableTooltip}
        disableTouchListener={disableTooltip}
      >
        <StyledTypography
          {...this.props}
          ref={this.textRef}
          onMouseOver={this._handleMouseOver}
        >
          {this.props.children}
        </StyledTypography>
      </Tooltip>
    );
  }

  private _handleMouseOver() {
    const textEl = ReactDOM.findDOMNode(this.textRef.current);
    if (textEl && textEl instanceof HTMLElement) {
      this.setState({
        disableTooltip: !isTextOverflow(textEl),
      });
    }
  }
}

export default ConversationListItemText;
export { ItemTextProps, ConversationListItemText };
