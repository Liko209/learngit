/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { SearchService } from 'sdk/module/search';
import { Props, RecentSearchTypes, ISearchItemModel } from '../types';

class GroupItemViewModel extends StoreViewModel<Props>
  implements ISearchItemModel {
  constructor(props: Props) {
    super(props);
    const { sectionIndex, cellIndex } = props;

    this.reaction(
      () => this.group,
      (group: GroupModel) => {
        this.props.didChange(sectionIndex, cellIndex);
        if (group.isArchived || group.deactivated) {
          SearchService.getInstance().removeRecentSearchRecords(
            new Set([group.id]),
          );
        }
      },
    );
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get canJoinTeam() {
    const { isMember, isTeam, privacy } = this.group;
    return isTeam && privacy === 'protected' && !isMember;
  }

  @computed
  get isPrivate() {
    const { isTeam, privacy } = this.group;
    return isTeam && privacy === 'private';
  }

  @computed
  get isJoined() {
    const { isTeam, privacy, isMember } = this.group;
    return isTeam && privacy === 'protected' && isMember;
  }

  @computed
  get hovered() {
    const { sectionIndex, selectIndex, cellIndex } = this.props;
    return sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];
  }

  @computed
  get shouldHidden() {
    const { isMember, deactivated, isArchived } = this.group;
    return deactivated || isArchived || (!isMember && this.isPrivate);
  }

  addRecentRecord = () => {
    const { isTeam } = this.group;

    SearchService.getInstance().addRecentSearchRecord(
      isTeam ? RecentSearchTypes.TEAM : RecentSearchTypes.GROUP,
      this.props.id,
    );
  }
}

export { GroupItemViewModel };
