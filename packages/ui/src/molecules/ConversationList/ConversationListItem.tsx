import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { WithTheme } from '@material-ui/core/styles/withTheme';
import { ListItem as MuiListItem, Tooltip } from '@material-ui/core';

import { Presence, Umi, Icon } from '../../atoms';
import { isTextOverflow } from '../../utils';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledListItem = styled(MuiListItem)`
&& {
  white-space: nowrap;
  padding: 6px 16px 6px 12px;
  background: white;
  color: #212121;
}

&&:hover {
  background: #f8f8f8;
}

&&:focus {
  background: #e0e0e0;
}

&& ${Icon} {
  opacity: 0;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

&&:hover ${Icon} {
  opacity: 1;
}
`;

type ItemProps = {
  title: string;
  status?: string;
  unreadCount?: number;
  showCount?: boolean;
  important?: boolean;
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
} & Partial<Pick<WithTheme, 'theme'>>;

type ItemStates = {
  disableTooltip: boolean;
};

class ConversationListItem extends React.Component<ItemProps, ItemStates> {
  textRef: React.RefObject<any>;

  constructor(props: ItemProps) {
    super(props);
    this.state = { disableTooltip: true };
    this.textRef = React.createRef();
    this._handleMouseOver = this._handleMouseOver.bind(this);
  }

  render() {
    const { title, status, unreadCount, important,
      showCount, onClick, onMoreClick } = this.props;
    const { disableTooltip } = this.state;

    const fontWeight = unreadCount ? 'bold' : 'normal';
    return (
      <StyledListItem
        button={true}
        onClick={onClick}
        onMouseOver={this._handleMouseOver}
      >
        <Presence status={status} />
        <Tooltip
          title={title}
          disableFocusListener={disableTooltip}
          disableHoverListener={disableTooltip}
          disableTouchListener={disableTooltip}
        >
          <ItemText
            ref={this.textRef}
            style={{ fontWeight }}
          >
            {title}
          </ItemText>
        </Tooltip>
        <Umi important={important} unreadCount={unreadCount} showCount={showCount} />
        <Icon onClick={onMoreClick}>more_vert</Icon>
      </StyledListItem>
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

export default ConversationListItem;
export { ItemProps, ConversationListItem };
