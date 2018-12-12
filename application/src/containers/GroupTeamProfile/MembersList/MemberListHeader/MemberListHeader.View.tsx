/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { MemberListHeaderViewProps } from './types';
import { JuiGroupProfileListHeader } from 'jui/pattern/GroupTeamProfile';
import { TypeDictionary } from 'sdk/utils';

type Props = WithNamespaces & MemberListHeaderViewProps;
@observer
class MemberListHeader extends React.Component<Props> {
  render() {
    const { counts, type, t, isShowHeaderShadow } = this.props;
    return (
      <JuiGroupProfileListHeader className={isShowHeaderShadow ? 'shadow' : ''}>
        {type === TypeDictionary.TYPE_ID_TEAM
          ? `${t('teamMembers')} (${counts})`
          : `${t('groupMembers')} (${counts})`}
      </JuiGroupProfileListHeader>
    );
  }
}
const MemberListHeaderView = translate('translations')(MemberListHeader);
export { MemberListHeaderView };
