/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import GroupModel from '@/store/models/Group';
import { JuiGroupProfileBody, JuiGroupProfileHeader } from 'jui/pattern/GroupTeamProfile';
type Props = WithNamespaces & {
  groupModel: GroupModel;
  description: string;
  displayName: string;
  destroy: () => void;
};
enum GROUP_BODY_TYPES {
  TEAM = 'TEAM',
  GROUP = 'GROUP',
}
@observer
class GroupTeamProfile extends React.Component<Props> {
  render() {
    const {
      destroy,
      // isShowGroupTeamProfileDialog,
      // // displayName,
      // // groupModel,
      // // description,
    } = this.props;
    return (
      <>
        <JuiGroupProfileHeader text="Profile" destroy={destroy} />
        <JuiGroupProfileBody type={GROUP_BODY_TYPES.TEAM} displayName="asdasdasdsad" description="sdsdsadsa"/>
      </>
    );
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
