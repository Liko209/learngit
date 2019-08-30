/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiTypography } from 'jui/foundation/Typography';
import { MenuProps, MenuViewProps } from './types';
import { JuiMenuList, JuiMenuItem, JuiSubMenu } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { ConvertToTeam } from '@/containers/ConvertToTeam';
import { NotificationPreferences } from '@/containers/NotificationPreferences';
import { CONVERSATION_TYPES } from '@/constants';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { teamActionHandler } from '@/common/handleTeamAction';
import { getProfileDialogComponent } from '@/common/OpenProfile';

@observer
class MenuComponent extends React.Component<
  WithTranslation & MenuProps & MenuViewProps
> {
  renderProfile = (title: string, dataTrackingProps: { category: string }) => (
    <OpenProfileDialog
      profileDialog={getProfileDialogComponent(this.props.profileId)}
      id={this.props.profileId}
      dataTrackingProps={{
        category: dataTrackingProps.category,
        source: 'conversationHeader_menu',
      }}
    >
      <JuiMenuItem data-test-automation-id="profileEntry">{title}</JuiMenuItem>
    </OpenProfileDialog>
  );

  renderNotificationPreferences = () => {
    const { t } = this.props;
    return (
      <JuiMenuItem
        onClick={this.onNotificationPreferences}
        data-test-automation-id="notificationPreferencesEntry"
      >
        {t('setting.conversationPreferences.entry')}
      </JuiMenuItem>
    );
  };

  onNotificationPreferences = () =>
    NotificationPreferences.show({ groupId: this.props.id });

  renderPeopleMenu = () => {
    const { t } = this.props;

    return (
      <JuiMenuList>
        {this.renderProfile(t('people.team.profile'), {
          category: 'Person',
        })}
        {this.renderNotificationPreferences()}
      </JuiMenuList>
    );
  };

  renderGroupMenu = () => {
    const { t } = this.props;

    return (
      <JuiMenuList>
        {this.renderProfile(t('people.team.profile'), {
          category: 'Group',
        })}
        {this.renderNotificationPreferences()}
        <JuiMenuItem onClick={this.onConvertToTeam}>
          {t('people.team.convertToTeam')}
        </JuiMenuItem>
      </JuiMenuList>
    );
  };

  onConvertToTeam = () => ConvertToTeam.show({ id: this.props.id });

  renderTeamMenu = () => {
    const { t, isAdmin, isCompanyTeam } = this.props;

    const adminActions = (
      <JuiSubMenu title={t('people.team.adminActions')}>
        <JuiMenuItem onClick={this.onArchiveTeam}>
          {t('people.team.archiveTeam')}
        </JuiMenuItem>
        <JuiMenuItem onClick={this.onDeleteTeam}>
          <JuiTypography color="error" variant="caption">
            {t('people.team.deleteTeam')}
          </JuiTypography>
        </JuiMenuItem>
      </JuiSubMenu>
    );

    return (
      <JuiMenuList>
        {this.renderProfile(t('people.team.teamDetails'), {
          category: 'Team',
        })}
        {this.renderNotificationPreferences()}
        {isAdmin && !isCompanyTeam ? adminActions : null}
      </JuiMenuList>
    );
  };

  onDeleteTeam = () => teamActionHandler.onTeamDelete(this.props.id);

  onArchiveTeam = () => teamActionHandler.onTeamArchive(this.props.id);

  renderMenuList = () => {
    switch (this.props.groupType) {
      case CONVERSATION_TYPES.TEAM:
        return this.renderTeamMenu();
      case CONVERSATION_TYPES.NORMAL_GROUP:
        return this.renderGroupMenu();
      default:
        return this.renderPeopleMenu();
    }
  };

  renderMenuAnchor = () => (
    <JuiIconButton
      size="medium"
      tooltipTitle={this.props.t('common.more')}
      ariaLabel={this.props.t('common.more')}
    >
      more_vert
    </JuiIconButton>
  );

  render() {
    return (
      <JuiPopoverMenu
        Anchor={this.renderMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {this.renderMenuList()}
      </JuiPopoverMenu>
    );
  }
}

const MenuView = withTranslation('translations')(MenuComponent);

export { MenuView };
