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
import { StyledBottomBar, StyledProfileView } from 'jui/pattern/GroupTeamProfile';
import { CONVERSATION_TYPES } from '@/constants';

@observer
class GroupTeamProfile extends React.Component<GroupTeamProps> {
  render() {
    const {
      destroy,
      id,
      type,
    } = this.props;
    return (
      <StyledProfileView>
        <ProfileHeader destroy={destroy} id={id} />
        <ProfileBody id={id} destroy={destroy} type={type} />
        {
          type === CONVERSATION_TYPES.TEAM || type === CONVERSATION_TYPES.NORMAL_GROUP ? (
           <>
             <MemberListHeader id={id} type={type}/>
             <MembersList id={id} type={type}/>
             <StyledBottomBar />
           </>
          ) : null
        }
      </StyledProfileView>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
