import React from 'react';
import styled, { withTheme } from 'styled-components';

import { WithTheme } from '@material-ui/core';
import MenuList from '@material-ui/core/MenuList';

import ConversationListItem from './ConversationListItem';

export type ConversationListProps = {
  onChange?: Function;
  onClick?: Function;
  value: any;
} & Partial<Pick<WithTheme, 'theme'>>;

export class TConversationList extends React.PureComponent<ConversationListProps> {

  constructor(props: ConversationListProps) {
    super(props);

    this._handleChange = this._handleChange.bind(this);
  }

  render() {
    return (
      <MenuList onClick={this._handleChange}>
        {this.props.children}
      </MenuList>
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
    console.log('el: ', el);
    if (!el.parentElement) return -1;
    return Array.from(el.parentElement.children).indexOf(el);
  }
}
export const ConversationList = styled<ConversationListProps>(withTheme(TConversationList))
  .attrs({})`
    & ${ConversationListItem}.selected {

    }
  `;

export default ConversationList;
