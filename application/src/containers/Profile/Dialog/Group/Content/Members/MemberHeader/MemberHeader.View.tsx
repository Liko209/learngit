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
  JuiProfileDialogContentSummaryButtonInRight as ButtonInRight,
} from 'jui/pattern/Profile/Dialog';

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
    } = this.props;
    const key = group.isTeam ? 'teamMembers' : 'groupMembers';
    return (
      <JuiProfileDialogContentMemberHeader
        className={hasShadow ? 'shadow' : ''}
        data-test-automation-id="profileDialogMemberHeader"
      >
        {`${t(key)} (${group.members && group.members.length})`}
        {isCurrentUserHasPermissionAddMember ? (
          <ButtonInRight onClick={AddTeamMembers}>
            <JuiIconography fontSize="small">add_team</JuiIconography>
            {t('AddTeamMembers')}
          </ButtonInRight>
        ) : null}
      </JuiProfileDialogContentMemberHeader>
    );
  }
}
const MemberHeaderView = translate('translations')(MemberHeader);

export { MemberHeaderView };
