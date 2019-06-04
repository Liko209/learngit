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
import { JuiMenuList, JuiMenuItem, JuiSubMenu } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { ConvertToTeam } from '@/containers/ConvertToTeam';
import { CONVERSATION_TYPES } from '@/constants';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { teamActionHandler } from '@/common/handleTeamAction';

@observer
class MenuComponent extends React.Component<
  WithTranslation & MenuProps & MenuViewProps
> {
  renderProfile = (title: string) => (
    <OpenProfileDialog id={this.props.profileId}>
      <JuiMenuItem data-test-automation-id="profileEntry">{title}</JuiMenuItem>
    </OpenProfileDialog>
  )

  renderPeopleMenu = () => {
    const { t } = this.props;

    return (
      <JuiMenuList>{this.renderProfile(t('people.team.profile'))}</JuiMenuList>
    );
  }

  renderGroupMenu = () => {
    const { t } = this.props;

    return (
      <JuiMenuList>
        {this.renderProfile(t('people.team.profile'))}
        <JuiMenuItem onClick={this.onConvertToTeam}>
          {t('people.team.convertToTeam')}
        </JuiMenuItem>
      </JuiMenuList>
    );
  }

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
        {this.renderProfile(t('people.team.teamDetails'))}
        {isAdmin && !isCompanyTeam ? adminActions : null}
      </JuiMenuList>
    );
  }

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
  }

  renderMenuAnchor = () => (
    <JuiIconButton
      size="medium"
      tooltipTitle={this.props.t('common.more')}
      ariaLabel={this.props.t('common.more')}
    >
      more_vert
    </JuiIconButton>
  )

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
