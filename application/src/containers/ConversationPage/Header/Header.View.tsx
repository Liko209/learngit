/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiConversationPageHeader } from 'jui/pattern/ConversationPageHeader';
import {
  JuiButtonBar,
  JuiCheckboxButton,
  JuiIconButton,
} from 'jui/components/Buttons';

import { observer } from 'mobx-react';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { toTitleCase } from '@/utils/helper';
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
} & InjectedTranslateProps;

@observer
class Header extends Component<HeaderProps> {
  constructor(props: HeaderProps) {
    super(props);
    this.rightButtonClickHandler = this.rightButtonClickHandler.bind(this);
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
    actionButtons.push(
      <JuiIconButton tooltipTitle={toTitleCase(t('conversationSettings'))}>
        settings
      </JuiIconButton>,
    );
    return (
      <JuiButtonBar size="medium" overlapping={true}>
        {actionButtons}
      </JuiButtonBar>
    );
  }

  private _SubTitle() {
    const { t, isFavorite, type, isPrivate } = this.props;
    return (
      <JuiButtonBar size="small" overlapping={true}>
        <JuiCheckboxButton
          tooltipTitle={
            isFavorite
              ? toTitleCase(t('removeFromFavorites'))
              : toTitleCase(t('addToFavorites'))
          }
          checkedIconName="star"
          iconName="star_border"
          checked={isFavorite}
        >
          star_border
        </JuiCheckboxButton>
        {type === CONVERSATION_TYPES.TEAM ? (
          <JuiCheckboxButton
            tooltipTitle={
              isPrivate ? t('thisIsAPrivateTeam') : t('thisIsAPublicTeam')
            }
            checkedIconName="lock"
            iconName="lock_open"
            checked={isPrivate}
          >
            favorite_border
          </JuiCheckboxButton>
        ) : null}
      </JuiButtonBar>
    );
  }

  render() {
    const { title } = this.props;

    return (
      <JuiConversationPageHeader
        title={title}
        SubTitle={this._SubTitle}
        Right={this._ActionButtons}
      />
    );
  }
}

const HeaderView = translate('ConversationPageHeader')(Header);

export { HeaderView };
