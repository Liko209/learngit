/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-12-3 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { MemberListProps } from '@/containers/GroupTeamProfile/MembersList/types';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';

class GroupTeamMembersViewModel extends StoreViewModel<MemberListProps> {
  @observable
  private _memberListHandler: SortableGroupMemberHandler | null = null;
  private _allMemberIds: number[] = [];
  @computed
  private get _id() {
    return this.props.id;
  }
  @action
  private _createSortableMemberIds = async () => {
    if (!this._memberListHandler) {
      this._memberListHandler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
        this._id,
      );
    }
  }
  @computed
  get allMemberIds() {
    this._createSortableMemberIds();
    this._allMemberIds = this._memberListHandler
      ? this._memberListHandler.getSortedGroupMembersIds()
      : [];
    return this._allMemberIds;
  }
}
export { GroupTeamMembersViewModel };
