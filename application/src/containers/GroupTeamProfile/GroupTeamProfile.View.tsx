/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { JuiGroupProfileBody, JuiGroupProfileHeader } from 'jui/pattern/GroupTeamProfile';
import { GROUP_TYPES, GroupTeamProps } from './types';
import { MembersList } from './MembersList';

@observer
class GroupTeamProfile extends React.Component<GroupTeamProps> {
  render() {
    const {
      destroy,
      displayName,
      description,
    } = this.props;
    return (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <JuiGroupProfileHeader text="Profile" destroy={destroy} />
        <JuiGroupProfileBody type={GROUP_TYPES.TEAM} displayName={displayName} description={description}/>
        <MembersList />
      </div>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
