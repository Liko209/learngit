/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { t } from 'i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiMenu, JuiMenuItem } from 'jui/components';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { JuiModal } from '@/containers/Dialog';
import { JuiCheckboxLabel } from 'jui/components/Checkbox';
import { JuiTypography } from 'jui/foundation/Typography';
import { MenuViewProps } from './types';

type Props = MenuViewProps & RouteComponentProps;
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
    if (!this.props.umiHint) {
      return (
        <JuiMenuItem onClick={this._handleCloseConversation}>
          {t('conversationMenuItem:close')}
        </JuiMenuItem>
      );
    }
    return null;
  }

  private _handleToggleFavorite(event: MouseEvent<HTMLElement>) {
    this.props.onClose(event);
    this.props.toggleFavorite();
  }

  private _checkboxChange(event: React.ChangeEvent<{}>, checked: boolean) {
    this.setState({
      checked,
    });
  }

  private _handleCloseConversation(event: MouseEvent<HTMLElement>) {
    this.props.onClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversation();
    } else {
      this.setState({
        checked: false,
      });
      JuiModal.alert({
        title: t('conversationMenuItem:closeConfirmDialogHeader'),
        content: (
          <>
            <JuiTypography>
              {t('conversationMenuItem:closeConfirmDialogDontAskMeAgain')}
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
          this._closeConversation();
        },
      });
    }
  }

  private async _closeConversation() {
    const { checked } = this.state;
    const result = await this.props.closeConversation(checked);
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

  render() {
    const { anchorEl, onClose, favoriteText } = this.props;
    return (
      <JuiMenu
        id="render-props-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
      >
        <JuiMenuItem onClick={this._handleToggleFavorite}>
          {t(`conversationMenuItem:${favoriteText}`)}
        </JuiMenuItem>
        {this.renderCloseMenuItem()}
      </JuiMenu>
    );
  }
}

const MenuView = withRouter(MenuViewComponent);

export { MenuView };
