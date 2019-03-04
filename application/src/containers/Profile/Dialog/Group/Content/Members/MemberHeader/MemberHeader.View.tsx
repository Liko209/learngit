/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { MemberHeaderViewProps, MemberHeaderProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';
import {
  JuiProfileDialogContentMemberHeader,
  JuiProfileDialogContentMemberHeaderTitle,
  JuiProfileDialogContentMemberHeaderSearch,
  JuiProfileDialogContentSummaryButtonInRight as ButtonInRight,
} from 'jui/pattern/Profile/Dialog';
import { JuiOutlineTextField } from 'jui/components';
import portalManager from '@/common/PortalManager';
import { Dialog } from '@/containers/Dialog';
import { AddMembers } from '../../AddMembers';

@observer
class MemberHeader extends React.Component<
  WithNamespaces & MemberHeaderViewProps & MemberHeaderProps
> {
  addTeamMembers = () => {
    const { group } = this.props;
    portalManager.dismissLast();
    Dialog.simple(<AddMembers group={group} />, {
      size: 'medium',
    });
  }

  render() {
    const {
      group,
      t,
      hasShadow,
      isCurrentUserHasPermissionAddMember,
      onSearch,
    } = this.props;
    const { isTeam, members = [] } = group;
    const key = isTeam ? 'people.team.teamMembers' : 'people.team.groupMembers';
    const hasSearch = members.length > 10;
    return (
      <JuiProfileDialogContentMemberHeader
        className={hasShadow ? 'shadow' : ''}
        data-test-automation-id="profileDialogMemberHeader"
      >
        <JuiProfileDialogContentMemberHeaderTitle>
          {`${t(key)} (${members.length})`}
          {isTeam && isCurrentUserHasPermissionAddMember && (
            <ButtonInRight onClick={this.addTeamMembers}>
              <JuiIconography fontSize="small">add_team</JuiIconography>
              {t('people.team.AddTeamMembers')}
            </ButtonInRight>
          )}
        </JuiProfileDialogContentMemberHeaderTitle>
        {hasSearch && (
          <JuiProfileDialogContentMemberHeaderSearch>
            <JuiOutlineTextField
              placeholder={t('people.team.searchMembers')}
              iconName="search"
              iconPosition="left"
              maxLength={30}
              onChange={onSearch}
              data-test-automation-id="profileDialogMemberSearch"
            />
          </JuiProfileDialogContentMemberHeaderSearch>
        )}
      </JuiProfileDialogContentMemberHeader>
    );
  }
}
const MemberHeaderView = translate('translations')(MemberHeader);

export { MemberHeaderView };
