/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiNewActions } from 'jui/pattern/TopBar';
import { JuiIconButton } from 'jui/components/Buttons';
import { CreateTeam } from '@/containers/CreateTeam';
import { NewMessage } from '@/containers/NewMessage';

type NewActionsProps = WithNamespaces & ViewProps;

@observer
class NewActions extends React.Component<NewActionsProps> {
  constructor(props: NewActionsProps) {
    super(props);
    this._Anchor = this._Anchor.bind(this);
  }

  private _Anchor() {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="medium"
        tooltipTitle={t('newActions')}
        data-test-automation-id="addMenuBtn"
      >
        new_actions
      </JuiIconButton>
    );
  }

  handleCreateTeam = () => {
    this.props.updateCreateTeamDialogState();
  }

  handleNewMessage = () => {
    this.props.updateNewMessageDialogState();
  }

  render() {
    const { t, isShowCreateTeamDialog, isShowNewMessageDialog } = this.props;

    return (
      <>
        <JuiNewActions
          Anchor={this._Anchor}
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
        </JuiNewActions>
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
