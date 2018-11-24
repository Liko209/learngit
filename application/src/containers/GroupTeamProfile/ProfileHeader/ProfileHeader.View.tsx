/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { JuiGroupProfileHeader } from 'jui/pattern/GroupTeamProfile';
import { MoreHorizIcon, Favorite, Privacy } from '@/containers/common';
import { ProfileHeaderViewProps } from './types';

@observer
class ProfileHeader extends React.Component<ProfileHeaderViewProps> {
  render() {
    const {
      text = 'Profile',
      destroy,
      groupId,
      t,
    } = this.props;
    return (
      <>
        <JuiGroupProfileHeader text={t(text)} destroy={destroy}>
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
