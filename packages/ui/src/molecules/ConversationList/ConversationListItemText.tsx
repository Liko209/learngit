import React, { Component, CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import MuiTypography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import { isTextOverflow } from '../../utils';

const StyledTypography = styled(MuiTypography)`
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
  tipOpen: boolean;
};

class ConversationListItemText extends Component<ItemTextProps, ItemTextStates> {
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

    return (
      <Tooltip
        title={this.props.children}
        disableFocusListener={false}
        disableHoverListener={false}
        disableTouchListener={false}
        open={tipOpen}
      >
        <StyledTypography
          {...this.props}
          ref={this.textRef}
          onMouseEnter={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
        >
          {this.props.children}
        </StyledTypography>
      </Tooltip>
    );
  }

  componentDidMount() {
    const textEl = ReactDOM.findDOMNode(this.textRef.current);

    if (textEl && textEl instanceof HTMLElement) {
      this.textEl = textEl;
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
