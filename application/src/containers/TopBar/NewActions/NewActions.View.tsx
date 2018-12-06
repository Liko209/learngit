/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps } from './types';
import { JuiPopover, JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiIconButton } from 'jui/components/Buttons';
import { CreateTeam } from '@/containers/CreateTeam';
import { NewMessage } from '@/containers/NewMessage';

type NewActionsProps = WithNamespaces & ViewProps;

@observer
class NewActions extends React.Component<NewActionsProps> {
  state = {
    anchorEl: null,
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  }

  handleCreateTeam = () => {
    this.props.updateCreateTeamDialogState();
    this.handleClose();
  }

  handleNewMessage = () => {
    this.props.updateNewMessageDialogState();
    this.handleClose();
  }

  render() {
    const { t, isShowCreateTeamDialog, isShowNewMessageDialog } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <>
        <JuiIconButton
          size="medium"
          tooltipTitle={t('NewActions')}
          data-test-automation-id="addMenuBtn"
          onClick={this.handleClick}
        >
          add_circle
        </JuiIconButton>
        <JuiPopover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <JuiMenuList>
            <JuiMenuItem onClick={this.handleCreateTeam}>
              {t('CreateTeam')}
            </JuiMenuItem>
            <JuiMenuItem
              onClick={this.handleNewMessage}
              data-test-automation-id="sendNewMessage"
            >
              {t('SendNewMessage')}
            </JuiMenuItem>
          </JuiMenuList>
        </JuiPopover>
        {isShowCreateTeamDialog && <CreateTeam />}
        {isShowNewMessageDialog && (
          <NewMessage data-test-automation-id="newMessageModal" />
        )}
      </>
    );
  }
}
const NewActionsView = translate('translations')(NewActions);

export { NewActionsView };
