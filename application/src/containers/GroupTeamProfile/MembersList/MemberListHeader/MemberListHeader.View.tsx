/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { MemberListHeaderViewProps } from './types';
import { StyledTitle } from 'jui/pattern/GroupTeamProfile';
import { CONVERSATION_TYPES } from '@/constants';

@observer
class MemberListHeader extends React.Component<MemberListHeaderViewProps> {
  render() {
    const { counts, type, t , isShowHeaderShadow } = this.props;
    return (
      <StyledTitle className={isShowHeaderShadow ? 'shadow' : ''}>
        {type === CONVERSATION_TYPES.TEAM
          ? `${t('TeamMembers')} (${counts})`
          : `${t('GroupMembers')} (${counts})`}
      </StyledTitle>
    );
  }
}
const MemberListHeaderView = translate('translations')(MemberListHeader);
export { MemberListHeaderView };
