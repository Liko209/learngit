import React, { Component, MouseEvent } from 'react';
import { MenuViewProps } from './types';
import { observer } from 'mobx-react';
import { t } from 'i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiMenu } from 'jui/patterns';
import { MenuItem } from 'ui-components/atoms/MenuItem';
import showDialogWithCheckView from '../../Dialog/DialogWithCheckView';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';

@observer
class MenuView extends Component<MenuViewProps> {
  constructor(props: MenuViewProps) {
    super(props);
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
    this.onFavoriteTogglerClick = this.onFavoriteTogglerClick.bind(this);
  }
  renderCloseMenuItem() {
    if (!this.props.umiHint) {
      return (
        <MenuItem onClick={this.onCloseButtonClick}>
          {t('conversationMenuItem:close')}
        </MenuItem>
      );
    }
    return <React.Fragment />;
  }

  render() {
    const { anchorEl, menuOpen, onMenuClose } = this.props;
    return (
      <JuiMenu
        id="render-props-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={onMenuClose}
      >
        <MenuItem onClick={this.onFavoriteTogglerClick}>
          {t(`conversationMenuItem:${this.props.favoriteText}`)}
        </MenuItem>
        {this.renderCloseMenuItem()}
      </JuiMenu>
    );
  }

  onFavoriteTogglerClick(event: MouseEvent<HTMLElement>) {
    this.props.onMenuClose(event);
    this.props.toggleFavorite();
  }

  onCloseButtonClick(event: MouseEvent<HTMLElement>) {
    this.props.onMenuClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversation(true);
    } else {
      showDialogWithCheckView({
        header: t('conversationMenuItem:closeConfirmDialogHeader'),
        content: t('conversationMenuItem:closeConfirmDialogContent'),
        checkBoxContent: t(
          'conversationMenuItem:closeConfirmDialogDontAskMeAgain',
        ),
        okText: t('conversationMenuItem:Close Conversation'),
        onClose: (isChecked: boolean, event: MouseEvent<HTMLElement>) => {
          this._closeConversation(isChecked);
        },
      });
    }
  }

  private async _closeConversation(shouldSkipNextTime: boolean) {
    const result = await this.props.closeConversation(shouldSkipNextTime);
    this._handleResult(result);
  }

  private _handleResult(error: ServiceCommonErrorType) {
    if (error === ServiceCommonErrorType.NONE) {
      // jump to section
      const match = /messages\/(\d+)/.exec(window.location.href);
      if (match && this.props.id === Number(match[1])) {
        const { history } = this.props;
        history.replace('/messages');
      }
      return;
    }
  }
}
export { MenuView };
