/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiGroupProfileHeader } from 'jui/pattern/GroupTeamProfile';
import { Favorite, Privacy } from '@/containers/common';
import { ProfileHeaderViewProps } from './types';
import { MoreHorizIcon } from './MoreHoriz';

type Props = WithNamespaces & ProfileHeaderViewProps;

@observer
class ProfileHeader extends React.Component<Props> {
  render() {
    const { title = 'Profile', dismiss, id, isTeam, type, t } = this.props;
    const privacy = <Privacy id={id} />;
    const moreIcon = <MoreHorizIcon id={id} type={type} />;
    return (
      <JuiGroupProfileHeader
        title={t(title)}
        dismiss={dismiss}
        toolTipCloseTitle={t('close')}
      >
        {isTeam ? privacy : null}
        <Favorite id={id} />
        {isTeam ? moreIcon : null}
      </JuiGroupProfileHeader>
    );
  }
}
const ProfileHeaderView = translate('translations')(ProfileHeader);
export { ProfileHeaderView };
