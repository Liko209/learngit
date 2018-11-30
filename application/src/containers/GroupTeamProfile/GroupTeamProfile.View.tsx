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
import { StyledIEWrapper, StyledBottomBar, StyledProfileView } from 'jui/pattern/GroupTeamProfile';
import { TypeDictionary } from 'sdk/utils';

@observer
class GroupTeamProfile extends React.Component<GroupTeamProps> {
  render() {
    const {
      dismiss,
      id,
      type,
    } = this.props;
    return (
      <StyledIEWrapper>
        <StyledProfileView>
          <ProfileHeader dismiss={dismiss} id={id} type={type} />
          <ProfileBody id={id} dismiss={dismiss} type={type} />
          {
            type === TypeDictionary.TYPE_ID_TEAM || type === TypeDictionary.TYPE_ID_GROUP ? (
              <>
                <MemberListHeader id={id} type={type}/>
                <MembersList id={id} type={type}/>
                <StyledBottomBar />
              </>
            ) : null
          }
        </StyledProfileView>
      </StyledIEWrapper>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
