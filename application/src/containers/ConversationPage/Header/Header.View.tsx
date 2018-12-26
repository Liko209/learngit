/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ServiceResult } from 'sdk/service/ServiceResult';
import { Profile } from 'sdk/models';
import {
  JuiConversationPageHeader,
  JuiConversationPageHeaderSubtitle,
} from 'jui/pattern/ConversationPageHeader';
import {
  JuiButtonBar,
  JuiIconButton,
} from 'jui/components/Buttons';
import { Favorite, Privacy } from '@/containers/common';
import { translate, WithNamespaces } from 'react-i18next';
import { toTitleCase } from '@/utils/string';
import { CONVERSATION_TYPES } from '@/constants';

type HeaderProps = {
  title: string;
  isFavorite: boolean;
  isPrivate: boolean;
  type: CONVERSATION_TYPES;
  actions: {
    name: string;
    iconName: string;
    tooltip: string;
  }[];
  customStatus: string | null;
  groupId: number;
  onFavoriteButtonHandler: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => Promise<ServiceResult<Profile>>;
} & WithNamespaces;

@observer
class Header extends Component<HeaderProps, { awake: boolean }> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      awake: false,
    };
    this.rightButtonClickHandler = this.rightButtonClickHandler.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onUnhover = this._onUnhover.bind(this);
  }
  rightButtonClickHandler(evt: React.SyntheticEvent, name: string) {
    // console.log(evt, name);
  }

  private _ActionButtons() {
    const { actions, t } = this.props;
    const actionButtons = actions.map(({ name, iconName, tooltip }) =>
      ((name: string) => {
        const onRightButtonClick = (e: React.SyntheticEvent) =>
          this.rightButtonClickHandler(e, name);
        return (
          <JuiIconButton
            key={name}
            tooltipTitle={toTitleCase(t(tooltip))}
            onClick={onRightButtonClick}
          >
            {iconName}
          </JuiIconButton>
        );
      })(name),
    );
    // hide toggle right rail button
    return (
      <JuiButtonBar size="medium" overlapSize={1} awake={this.state.awake}>
        {actionButtons}
      </JuiButtonBar>
    );
  }

  private _SubTitle() {
    const {
      type,
      groupId,
    } = this.props;

    return (
      <JuiConversationPageHeaderSubtitle>
        {type === CONVERSATION_TYPES.TEAM ? <Privacy id={groupId} size="medium" /> : null}
        <Favorite id={groupId} size="medium" />
      </JuiConversationPageHeaderSubtitle>
    );
  }

  private _onHover() {
    this.setState({
      awake: true,
    });
  }

  private _onUnhover() {
    this.setState({
      awake: false,
    });
  }

  render() {
    const { title, customStatus } = this.props;

    return (
      <JuiConversationPageHeader
        data-test-automation-id="conversation-page-header"
        title={title}
        status={customStatus}
        SubTitle={this._SubTitle()}
        Right={this._ActionButtons()}
        onMouseEnter={this._onHover}
        onMouseLeave={this._onUnhover}
      />
    );
  }
}

const HeaderView = translate('ConversationPageHeader')(Header);

export { HeaderView, HeaderProps };
