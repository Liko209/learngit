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
      destroy,
      groupId,
      t,
    } = this.props;
    return (
      <>
        <JuiGroupProfileHeader title={t(title)} destroy={destroy}>
          <Privacy id={groupId} isShowTooltip={false}/>
          <Favorite id={groupId} isShowTooltip={false} isAction={false}/>
          <MoreHorizIcon id={groupId}/>
        </JuiGroupProfileHeader>
      </>
    );
  }
}
const ProfileHeaderView = translate('translations')(ProfileHeader);
export { ProfileHeaderView };
