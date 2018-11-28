/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { JuiGroupProfileHeader } from 'jui/pattern/GroupTeamProfile';
import { Favorite, Privacy } from '@/containers/common';
import { ProfileHeaderViewProps } from './types';
import { MoreHorizIcon } from './MoreHoriz';

@observer
class ProfileHeader extends React.Component<ProfileHeaderViewProps> {
  render() {
    const {
      title = 'Profile',
      dismiss,
      groupId,
      type,
      t,
    } = this.props;
    return (
      <>
        <JuiGroupProfileHeader title={t(title)} dismiss={dismiss}>
          <Privacy id={groupId} disableToolTip={false}/>
          <Favorite id={groupId} disableToolTip={false} isAction={false}/>
          <MoreHorizIcon id={groupId} type={type}/>
        </JuiGroupProfileHeader>
      </>
    );
  }
}
const ProfileHeaderView = translate('translations')(ProfileHeader);
export { ProfileHeaderView };
