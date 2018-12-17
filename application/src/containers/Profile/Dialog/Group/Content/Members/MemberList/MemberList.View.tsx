/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiProfileDialogContentMemberList } from 'jui/pattern/Profile/Dialog';
import { MemberListViewProps } from './types';
import { MemberListItem } from '../MemberListItem';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';

@observer
class MemberList extends React.Component<WithNamespaces & MemberListViewProps> {
  componentWillUnmount() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
  }

  render() {
    const { memberIds, id } = this.props;
    return (
      <JuiProfileDialogContentMemberList>
        {memberIds.map((pid: number) => {
          return <MemberListItem key={pid} cid={id} pid={pid} />;
        })}
      </JuiProfileDialogContentMemberList>
    );
  }
}
const MemberListView = translate('translations')(MemberList);

export { MemberListView };
