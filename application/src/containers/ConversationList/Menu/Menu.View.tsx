/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiMenu, JuiMenuItem } from 'jui/components';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { JuiModal } from '@/containers/Dialog';
import { JuiCheckboxLabel } from 'jui/components/Checkbox';
import { JuiTypography } from 'jui/foundation/Typography';
import { MenuViewProps } from './types';
import { GroupTeamProfile } from '@/containers/GroupTeamProfile';

type Props = MenuViewProps & RouteComponentProps & WithNamespaces;
type State = {
  checked: boolean;
};
@observer
class MenuViewComponent extends Component<Props, State> {
  state = {
    checked: false,
  };

  constructor(props: Props) {
    super(props);
    this._handleToggleFavorite = this._handleToggleFavorite.bind(this);
    this._handleCloseConversation = this._handleCloseConversation.bind(this);
    this._checkboxChange = this._checkboxChange.bind(this);
  }

  renderCloseMenuItem() {
    const { t } = this.props;
    if (this.props.showClose) {
      return (
        <JuiMenuItem onClick={this._handleCloseConversation}>
          {t('conversationMenuItem:close')}
        </JuiMenuItem>
      );
    }
    return null;
  }

  private async _handleToggleFavorite(event: MouseEvent<HTMLElement>) {
    const { t } = this.props;
    this.props.onClose(event);
    const result = await this.props.toggleFavorite();
    if (result === ServiceCommonErrorType.SERVER_ERROR) {
      JuiModal.alert({
        title: '',
        content: t('conversationMenuItem:markFavoriteServerErrorContent'),
        okText: t('conversationMenuItem:OK'),
        okBtnType: 'text',
        onOK: () => {},
      });
    }
  }

  private _checkboxChange(event: React.ChangeEvent<{}>, checked: boolean) {
    this.setState({
      checked,
    });
  }

  private _handleCloseConversation(event: MouseEvent<HTMLElement>) {
    const { t } = this.props;
    this.props.onClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversationWithoutConfirmDialog();
    } else {
      this.setState({
        checked: false,
      });
      JuiModal.alert({
        title: t('conversationMenuItem:closeConfirmDialogHeader'),
        content: (
          <>
            <JuiTypography>
              {t('conversationMenuItem:closeConfirmDialogContent')}
            </JuiTypography>
            <JuiCheckboxLabel
              label={t('conversationMenuItem:closeConfirmDialogDontAskMeAgain')}
              checked={false}
              handleChange={this._checkboxChange}
            />
          </>
        ),
        okText: t('conversationMenuItem:Close Conversation'),
        okBtnType: 'text',
        onOK: () => {
          this._closeConversationWithConfirm();
        },
      });
    }
  }

  private async _closeConversationWithConfirm() {
    const { checked } = this.state;
    this._closeConversation(checked);
  }

  private async _closeConversationWithoutConfirmDialog() {
    this._closeConversation(true);
  }

  private async _closeConversation(shouldSkipCloseConfirmation: boolean) {
    const result = await this.props.closeConversation(
      shouldSkipCloseConfirmation,
    );
    if (result === ServiceCommonErrorType.NONE) {
      // jump to section
      const match = /messages\/(\d+)/.exec(window.location.href);
      if (match && this.props.groupId === Number(match[1])) {
        const { history } = this.props;
        history.replace('/messages');
      }
      return;
    }
  }
  private _handleGroupDialog = (event: MouseEvent<HTMLElement>) => {
    this.props.handleGlobalGroupId(event);
    JuiModal.open(GroupTeamProfile, { size: 'medium' });
  }
  render() {
    const {
      anchorEl,
      onClose,
      favoriteText,
      isShowGroupTeamProfile,
      t,
    } = this.props;
    return (
      <JuiMenu
        id="render-props-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
      >
        <JuiMenuItem
          data-test-automation-id="favToggler"
          onClick={this._handleToggleFavorite}
        >
          {t(`conversationMenuItem:${favoriteText}`)}
        </JuiMenuItem>
        {isShowGroupTeamProfile ? (
          <JuiMenuItem onClick={this._handleGroupDialog}>
            {t('view profile')}
          </JuiMenuItem>
        ) : null}
        {this.renderCloseMenuItem()}
      </JuiMenu>
    );
  }
}

const MenuView = withRouter(
  translate('conversationMenuItem')(MenuViewComponent),
);

export { MenuView };
