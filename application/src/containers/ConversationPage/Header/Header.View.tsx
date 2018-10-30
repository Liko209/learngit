/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiConversationPageHeader,
  JuiConversationPageHeaderSubtitle,
} from 'jui/pattern/ConversationPageHeader';
import {
  JuiButtonBar,
  JuiCheckboxButton,
  JuiIconButton,
} from 'jui/components/Buttons';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { JuiModal } from '@/containers/Dialog';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
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
  customStatus: string | null;
  onFavoriteButtonHandler: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => Promise<ServiceCommonErrorType>;
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
    actionButtons.push(
      <JuiIconButton
        key="setting"
        tooltipTitle={toTitleCase(t('conversationSettings'))}
      >
        settings
      </JuiIconButton>,
    );
    return (
      <JuiButtonBar size="medium" overlapping={true} awake={this.state.awake}>
        {actionButtons}
      </JuiButtonBar>
    );
  }

  private _SubTitle() {
    const {
      t,
      isFavorite,
      type,
      isPrivate,
      customStatus,
      onFavoriteButtonHandler,
    } = this.props;
    const onchange = async (
      event: React.ChangeEvent<HTMLInputElement>,
      checked: boolean,
    ) => {
      const result = await onFavoriteButtonHandler(event, checked);
      if (result === ServiceCommonErrorType.SERVER_ERROR) {
        JuiModal.alert({
          title: '',
          content: t('conversationMenuItem:markFavoriteServerErrorContent'),
          okText: t('conversationMenuItem:OK'),
          okBtnType: 'text',
          onOK: () => {},
        });
      }
    };

    return (
      <JuiConversationPageHeaderSubtitle>
        {customStatus ? <span>{customStatus}</span> : null}
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
            onChange={onchange}
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
    const { title } = this.props;

    return (
      <JuiConversationPageHeader
        title={title}
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
