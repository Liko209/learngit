/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import styled from 'jui/foundation/styled-components';
import { GroupTeamProps } from './types';
import { MembersList } from './MembersList';
import { ProfileHeader } from './ProfileHeader';
import { ProfileBody } from './ProfileBody';
import { MemberListHeader } from './MembersList/MemberListHeader';
import { width } from 'jui/foundation/utils';

const StyledProfileView = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: ${width(3)} solid ${({ theme }) => theme.palette.common.white};
  box-shadow: 0 -2px 4px -2px rgba(0, 0, 0, 0.14);
`;
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
        <ProfileBody id={id}/>
        <MemberListHeader id={id}/>
        <MembersList id={id}/>
        <StyledBottomBar />
      </StyledProfileView>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
