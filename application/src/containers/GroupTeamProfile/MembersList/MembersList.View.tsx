/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import {
  StyledList,
} from 'jui/pattern/GroupTeamProfile';
import { MemberListViewProps } from './types';
import { MembersItem } from './MembersItem';

@observer
class MembersList extends React.Component<MemberListViewProps> {
  render() {
    const { memberIds, gid } = this.props;
    return (
      <StyledList>
        {memberIds.map((id: number) => {
          return (
            <MembersItem key={id} gid={gid} uid={id}/>
          );
        })}
      </StyledList>
    );
  }
}
const MembersListView = translate('translations')(MembersList);

export { MembersListView };
