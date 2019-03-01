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
import { JuiOutlineTextField } from 'jui/src/components';

@observer
class MemberHeader extends React.Component<
  WithNamespaces & MemberHeaderViewProps & MemberHeaderProps
> {
  render() {
    const {
      group,
      t,
      hasShadow,
      AddTeamMembers,
      isCurrentUserHasPermissionAddMember,
      sortedAllMemberIds,
    } = this.props;
    const { isTeam } = group;
    const key = isTeam ? 'people.team.teamMembers' : 'people.team.groupMembers';
    const hasSearch = sortedAllMemberIds.length > 10;
    return (
      <JuiProfileDialogContentMemberHeader
        className={hasShadow ? 'shadow' : ''}
        data-test-automation-id="profileDialogMemberHeader"
      >
        <JuiProfileDialogContentMemberHeaderTitle>
          {`${t(key)} (${group.members && group.members.length})`}
          {isTeam && isCurrentUserHasPermissionAddMember ? (
            <ButtonInRight onClick={AddTeamMembers}>
              <JuiIconography fontSize="small">add_team</JuiIconography>
              {t('people.team.AddTeamMembers')}
            </ButtonInRight>
          ) : null}
        </JuiProfileDialogContentMemberHeaderTitle>
        {hasSearch && (
          <JuiProfileDialogContentMemberHeaderSearch>
            <JuiOutlineTextField
              placeholder={t('people.team.searchMembers')}
              iconName="search"
              iconPosition="left"
              maxLength={30}
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
