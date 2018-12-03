/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { GroupTeamProps } from './types';
import { MembersList } from './MembersList';
import { ProfileHeader } from './ProfileHeader';
import { ProfileBody } from './ProfileBody';
import { MemberListHeader } from './MembersList/MemberListHeader';
import { JuiGroupProfileBottomBar, JuiGroupProfileView } from 'jui/pattern/GroupTeamProfile';

type Props = WithNamespaces & GroupTeamProps;

@observer
class GroupTeamProfile extends React.Component<Props> {
  render() {
    const {
      dismiss,
      id,
      type,
      isGroupOrTeam,
    } = this.props;
    return (
      <JuiGroupProfileView>
        <ProfileHeader dismiss={dismiss} id={id} type={type} />
        <ProfileBody id={id} dismiss={dismiss} type={type} isGroupOrTeam={isGroupOrTeam} />
        {
          isGroupOrTeam ? (
           <>
             <MemberListHeader id={id} type={type}/>
             <MembersList id={id} type={type}/>
             <JuiGroupProfileBottomBar />
           </>
          ) : null
        }
      </JuiGroupProfileView>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
