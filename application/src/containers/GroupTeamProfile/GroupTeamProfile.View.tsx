/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import GroupModel from '@/store/models/Group';

type Props = WithNamespaces & {
  groupModel: GroupModel;
  isShowGroupTeamProfileDialog: boolean;
  description: string;
  displayName: string;
};

@observer
class GroupTeamProfile extends React.Component<Props> {
  render() {
    const { isShowGroupTeamProfileDialog, displayName, groupModel, description } = this.props;
    console.log('isShowGroupTeamProfileDialog', isShowGroupTeamProfileDialog);
    console.log('displayName', displayName);
    console.log('groupModel', groupModel);
    console.log('description', description);
    return <></>;
  }
}
const GroupTeamProfileView = translate('translations')(GroupTeamProfile);
export { GroupTeamProfileView };
