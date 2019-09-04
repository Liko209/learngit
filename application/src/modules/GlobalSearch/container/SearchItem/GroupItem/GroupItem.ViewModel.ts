/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { computed, action } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { SearchService } from 'sdk/module/search';
import { Props, RecentSearchTypes, ISearchItemModel } from '../types';
import { SearchViewModel } from '../../common/Search.ViewModel';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { GlobalSearchService } from '../../../service';

class GroupItemViewModel extends SearchViewModel<Props>
  implements ISearchItemModel {
  constructor(props: Props) {
    super(props);

    this.reaction(
      () => this.group,
      () => {
        const { didChange } = this.props;
        didChange();
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
  get shouldHidden() {
    const { isMember, deactivated, isArchived } = this.group;
    const shouldHidden =
      deactivated || isArchived || (!isMember && this.isPrivate);
    return shouldHidden === undefined || shouldHidden;
  }

  @action
  closeGlobalSearch = () => {
    container.get(GlobalSearchService).closeGlobalSearch();
  };

  addRecentRecord = () => {
    const { isTeam } = this.group;

    this._getSearchService().addRecentSearchRecord(
      isTeam ? RecentSearchTypes.TEAM : RecentSearchTypes.GROUP,
      this.props.id,
    );
  };

  private _getSearchService() {
    return ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
  }
}

export { GroupItemViewModel };
