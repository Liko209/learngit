/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { ProfileDialogGroupViewModel } from '../../Group.ViewModel';
import { MembersViewProps } from './types';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';

class MembersViewModel extends ProfileDialogGroupViewModel
  implements MembersViewProps {
  @observable
  private _sortableGroupMemberHandler: SortableGroupMemberHandler | null = null;

  @action
  private _createSortableMemberIds = async () => {
    if (!this._sortableGroupMemberHandler) {
      this._sortableGroupMemberHandler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
        this.id,
      );
    }
  }

  @computed
  get sortedAllMemberIds() {
    this._createSortableMemberIds();
    const ids = this._sortableGroupMemberHandler
      ? this._sortableGroupMemberHandler.getSortedGroupMembersIds()
      : [];
    return ids;
  }
}
export { MembersViewModel };
