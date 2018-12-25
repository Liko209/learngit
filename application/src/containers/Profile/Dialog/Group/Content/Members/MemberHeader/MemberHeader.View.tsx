/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { MemberHeaderViewProps } from './types';
import { JuiProfileDialogContentMemberHeader } from 'jui/pattern/Profile/Dialog';

@observer
class MemberHeader extends React.Component<
  WithNamespaces & MemberHeaderViewProps
> {
  render() {
    const { group, t, hasShadow } = this.props;
    const key = group.isTeam ? 'teamMembers' : 'groupMembers';
    return (
      <JuiProfileDialogContentMemberHeader
        className={hasShadow ? 'shadow' : ''}
        data-test-automation-id="profileDialogMemberHeader"
      >
        {`${t(key)} (${group.members && group.members.length})`}
      </JuiProfileDialogContentMemberHeader>
    );
  }
}
const MemberHeaderView = translate('translations')(MemberHeader);

export { MemberHeaderView };
