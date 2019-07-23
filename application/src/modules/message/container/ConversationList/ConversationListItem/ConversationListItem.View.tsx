/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React, { MouseEvent } from 'react';
import { JuiConversationListItem } from 'jui/pattern/ConversationList';
import { Indicator } from '../Indicator';
import { Presence } from '@/containers/Presence';
import { CONVERSATION_TYPES } from '@/constants';
import { Menu } from '../Menu';
import { ConversationListItemViewProps } from './types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { withTranslation, WithTranslation } from 'react-i18next';

type Props = ConversationListItemViewProps & WithTranslation;
type State = {
  isHover: boolean;
};

@observer
class ConversationListItemViewComponent extends React.Component<Props, State> {
  @observable
  menuAnchorEl: HTMLElement | null = null;

  private _requiredShownPresenceConversationTypes = [
    CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
    // CONVERSATION_TYPES.ME
  ];

  state = {
    isHover: false,
  };

  constructor(props: Props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleMoreClick = this._handleMoreClick.bind(this);
    this._closeMenu = this._closeMenu.bind(this);
  }

  private get _showUmi() {
    return !!(this.props.umiHint && !this.state.isHover);
  }

  private _presence = () => {
    const { groupType } = this.props;
    return this._requiredShownPresenceConversationTypes.includes(groupType) ? (
      <Presence uid={this.props.personId} />
    ) : null;
  };
  private get _indicator() {
    if (this.props.selected) {
      return null;
    }
    return <Indicator id={this.props.groupId} showUmi={this._showUmi} />;
  }

  private _handleMouseOver = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      isHover: true,
    });
  };

  private _handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    this.menuAnchorEl = null;
    this.setState({
      isHover: false,
    });
  };

  render() {
    const { isHover } = this.state;
    return (
      <>
        <JuiConversationListItem
          className="conversation-list-item"
          data-test-automation-id="conversation-list-item"
          tabIndex={0}
          isItemHover={!!this.menuAnchorEl}
          data-group-id={this.props.groupId}
          presence={this._presence}
          umiHint={this.props.umiHint}
          indicator={this._indicator}
          onMoreClick={this._handleMoreClick}
          onClick={this._handleClick}
          title={this.props.displayName}
          selected={this.props.selected}
          hidden={this.props.hidden}
          onMouseOver={this._handleMouseOver}
          onMouseLeave={this._handleMouseLeave}
          moreTooltipTitle={this.props.t('common.more')}
        >
          {isHover && (
            <Menu
              groupId={this.props.groupId}
              anchorEl={this.menuAnchorEl}
              onClose={this._closeMenu}
            />
          )}
        </JuiConversationListItem>
      </>
    );
  }

  private _handleClick(event: MouseEvent<HTMLElement>) {
    this.props.onClick(event);
  }

  private _handleMoreClick(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
    this.menuAnchorEl = event.currentTarget;
  }

  private _closeMenu(event: MouseEvent<HTMLElement> | UIEvent) {
    event.stopPropagation();
    this.menuAnchorEl = null;
  }
}

const ConversationListItemView = withTranslation('translations')(
  ConversationListItemViewComponent,
);

export { ConversationListItemView };
