/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiGroupProfileMemberList,
} from 'jui/pattern/GroupTeamProfile';
import { MemberListViewProps } from './types';
import { MembersItem } from './MembersItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
const globalStore = storeManager.getGlobalStore();

type Props = WithNamespaces & MemberListViewProps;
@observer
class MembersList extends React.Component<Props> {
  componentWillUnmount() {
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
  }
  render() {
    const { memberIds, gid } = this.props;
    return (
      <JuiGroupProfileMemberList>
        {memberIds.map((id: number) => {
          return (
            <MembersItem key={id} gid={gid} uid={id}/>
          );
        })}
      </JuiGroupProfileMemberList>
    );
  }
}
const MembersListView = translate('translations')(MembersList);

export { MembersListView };
