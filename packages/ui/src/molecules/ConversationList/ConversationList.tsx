import React from 'react';
import styled from 'styled-components';

import { List } from '@material-ui/core';

type ConversationListProps = {
  value: any;
  className?: string;
  onClick?: Function;
  onChange?: Function;
};

class TConversationList extends React.PureComponent<ConversationListProps> {

  constructor(props: ConversationListProps) {
    super(props);

    this._handleChange = this._handleChange.bind(this);
  }

  render() {
    return (
      <List
        component="div"
        className={this.props.className}
        onClick={this._handleChange}
      >
        {this.props.children}
      </List>
    );
  }

  private _handleChange(event: React.MouseEvent) {
    const { onChange, onClick } = this.props;

    if (onChange) {
      onChange(event, this._findIndex(event.target));
    }

    if (onClick) {
      onClick(event);
    }
  }

  private _findIndex(el: any) {
    if (!el.parentElement) return -1;
    return Array.from(el.parentElement.children).indexOf(el);
  }
}

const ConversationList = styled<ConversationListProps>(TConversationList)`
  && {
    background-color: white;
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export default ConversationList;
export { ConversationListProps, ConversationList, TConversationList };
