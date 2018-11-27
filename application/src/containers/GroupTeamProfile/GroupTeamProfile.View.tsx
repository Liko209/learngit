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
import { width, palette } from 'jui/foundation/utils';

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
  border: ${width(3)} solid ${palette('common', 'white')};
  box-shadow: ${({ theme }) => theme.boxShadow.val2};
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
