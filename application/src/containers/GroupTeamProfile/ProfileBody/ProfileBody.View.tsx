/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ID_TYPE } from './types';
import { JuiGroupProfileBody } from 'jui/pattern/GroupTeamProfile';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Avatar } from '@/containers/Avatar';

// import { ProfileBodyProps } from './types';
type Props = WithNamespaces & {
  id: number;
  displayName: string;
  description?: string;
  idType: ID_TYPE;
};
@observer
class ProfileBody extends React.Component<Props> {
  render() {
    const {
      displayName,
      description,
      id,
      idType,
    } = this.props;
    let avatar;
    if (idType === ID_TYPE.GROUP || idType === ID_TYPE.TEAM) {
      avatar = <GroupAvatar cid={id} />;
    } else if (idType === ID_TYPE.PERSON) {
      avatar = <Avatar uid={id}/>;
    }
    return (
      <>
        <JuiGroupProfileBody avatar={avatar} displayName={displayName} description={description}/>
      </>
    );
  }
}
const ProfileBodyView = translate('translations')(ProfileBody);
export { ProfileBodyView };
