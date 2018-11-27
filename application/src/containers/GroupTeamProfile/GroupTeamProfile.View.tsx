/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { GroupTeamProps } from './types';
import { MembersList } from './MembersList';
import { ProfileHeader } from './ProfileHeader';
import { ProfileBody } from './ProfileBody';
import { MemberListHeader } from './MembersList/MemberListHeader';
import { StyledProfileView, StyledBottomBar } from 'jui/pattern/GroupTeamProfile';

@observer
class GroupTeamProfile extends React.Component<GroupTeamProps> {
  render() {
    const {
      destroy,
      id,
    } = this.props;
    return (
      <StyledProfileView>
        <ProfileHeader destroy={destroy} id={id} />
        <ProfileBody id={id} destroy={destroy}/>
        <MemberListHeader id={id}/>
        <MembersList id={id}/>
        <StyledBottomBar />
      </StyledProfileView>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
