/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
// import { translate } from 'react-i18next';
import { JuiGroupProfileHeader } from 'jui/pattern/GroupTeamProfile';
import { MoreHorizIcon } from '../MoreHoriz';
import { ProfileHeaderViewProps } from './types';

@observer
class ProfileHeaderView extends React.Component<ProfileHeaderViewProps> {
  render() {
    const {
      text = 'Profile',
      destroy,
    } = this.props;
    return (
      <>
        <JuiGroupProfileHeader text={text} destroy={destroy}>
          <MoreHorizIcon />
        </JuiGroupProfileHeader>
      </>
    );
  }
}
// const ProfileHeaderView = translate('translations')(ProfileHeader);
export { ProfileHeaderView };
