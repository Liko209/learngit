/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components/Menus';
import { JuiNewActions } from 'jui/pattern/TopBar';
import { JuiFabButton } from 'jui/components/Buttons';
import { CreateTeam } from '@/containers/CreateTeam';
import { NewMessage } from '@/containers/NewMessage';
import { withRCMode } from '@/containers/withRCMode';
import { analyticsCollector } from '@/AnalyticsCollector';

type NewActionsProps = WithTranslation & ViewProps;

@observer
@withRCMode()
class NewActions extends React.Component<NewActionsProps> {
  constructor(props: NewActionsProps) {
    super(props);
  }

  private _Anchor = () => {
    const { t } = this.props;
    return (
      <JuiFabButton
        size="medium"
        tooltipTitle={t('home.newActions')}
        data-test-automation-id="addMenuBtn"
        iconName="new_actions"
        disableRipple
      />
    );
  };

  handleCreateTeam = () => {
    analyticsCollector.createTeamDialog();
    CreateTeam.show();
  };

  handleNewMessage = () => {
    analyticsCollector.newMessageDialog();
    NewMessage.show();
  };

  renderCreateTeam() {
    const { t, canCreateTeam } = this.props;
    return canCreateTeam ? (
      <JuiMenuItem
        onClick={this.handleCreateTeam}
        data-test-automation-id="createTeam"
      >
        {t('people.team.CreateTeam')}
      </JuiMenuItem>
    ) : null;
  }

  renderSendNewMessage() {
    const { t, canSendNewMessage } = this.props;
    return canSendNewMessage ? (
      <JuiMenuItem
        onClick={this.handleNewMessage}
        data-test-automation-id="sendNewMessage"
      >
        {t('message.action.sendNewMessage')}
      </JuiMenuItem>
    ) : null;
  }

  render() {
    return (
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
          {this.renderSendNewMessage()}
          {this.renderCreateTeam()}
        </JuiMenuList>
      </JuiNewActions>
    );
  }
}
const NewActionsView = withTranslation('translations')(NewActions);

export { NewActionsView };
