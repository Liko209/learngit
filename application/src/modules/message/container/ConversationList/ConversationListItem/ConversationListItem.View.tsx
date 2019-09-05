/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
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
import { extraScrollPadding } from '@/utils/system';

type Props = ConversationListItemViewProps & WithTranslation;
type State = {
  isHover: boolean;
};

const HOVER_DELAY = 30;
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

  _mouseEnterTimer: number | undefined = undefined;
  // mouseOver is needed because when mouse jump from popover overlay to the menu item,
  // it won't trigger mouseEnter event
  _mouseOverTimer: number | undefined = undefined;

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
      <Presence uid={this.props.personId} borderSize="small" />
    ) : null;
  };
  private get _indicator() {
    return (
      <Indicator
        selected={this.props.selected}
        id={this.props.groupId}
        showUmi={this._showUmi}
      />
    );
  }

  private _handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.clearTimeout(this._mouseEnterTimer);
    this._mouseEnterTimer = window.setTimeout(() => {
      this.setState({
        isHover: true,
      });
    }, HOVER_DELAY);
  };

  private _handleMoreOver = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.clearTimeout(this._mouseOverTimer);
    this._mouseOverTimer = window.setTimeout(() => {
      if (!this.state.isHover) {
        this.setState({ isHover: true });
      }
    }, HOVER_DELAY);
  };

  private _handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.clearTimeout(this._mouseEnterTimer);
    window.clearTimeout(this._mouseOverTimer);
    if (this.state.isHover) {
      this.menuAnchorEl = null;
      this.setState({
        isHover: false,
      });
    }
  };

  render() {
    const { isHover } = this.state;
    return (
      <>
        <JuiConversationListItem
          className="conversation-list-item"
          extraScrollPadding={extraScrollPadding}
          data-test-automation-id="conversation-list-item"
          tabIndex={0}
          isItemHover={isHover}
          data-group-id={this.props.groupId}
          presence={this._presence}
          umiHint={this.props.umiHint}
          indicator={this._indicator}
          onMoreClick={this._handleMoreClick}
          onClick={this._handleClick}
          title={this.props.displayName}
          selected={this.props.selected}
          hidden={this.props.hidden}
          onMouseLeave={this._handleMouseLeave}
          onMouseEnter={this._handleMouseEnter}
          onMouseOver={this._handleMoreOver}
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
    this.setState({
      isHover: false,
    });
  }
}

const ConversationListItemView = withTranslation('translations')(
  ConversationListItemViewComponent,
);

export { ConversationListItemView };
