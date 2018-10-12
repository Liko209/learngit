/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:21:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { service } from 'sdk';
import { GROUP_QUERY_TYPE, ENTITY } from 'sdk/service';
import { Group, Profile } from 'sdk/models';
import storeManager, { ENTITY_NAME } from '@/store';
import { getSingleEntity, getEntity } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import {
  SectionProps,
  SectionConfig,
  SectionConfigs,
  SectionViewProps,
  SECTION_TYPE,
} from './types';
import { StoreViewModel } from '@/store/ViewModel';

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  FetchDataDirection,
  ISortableModel,
} from '@/store/base/fetch';

const { GroupService } = service;

function groupTransformFunc(data: Group): ISortableModel<Group> {
  return {
    id: data.id,
    sortValue: -(data.most_recent_post_created_at || data.created_at),
  };
}

function favGroupTransformFunc(data: Group): ISortableModel<Group> {
  return {
    id: data.id,
    sortValue: 0,
  };
}

const SECTION_CONFIGS: SectionConfigs = {
  [SECTION_TYPE.FAVORITE]: {
    title: 'favorite_plural',
    iconName: 'start',
    eventName: ENTITY.FAVORITE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
    transformFun: favGroupTransformFunc,
    sortable: true,
    isMatchFun: (model: Group) => {
      return true;
    },
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'people',
    eventName: ENTITY.PEOPLE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.GROUP,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return !model.is_team;
    },
  },
  [SECTION_TYPE.TEAM]: {
    title: 'team_plural',
    iconName: 'people',
    eventName: ENTITY.TEAM_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.TEAM,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return model.is_team || false;
    },
  },
};

class GroupDataProvider implements IFetchSortableDataProvider<Group> {
  private _queryType: GROUP_QUERY_TYPE;
  constructor(queryType: GROUP_QUERY_TYPE) {
    this._queryType = queryType;
  }

  async fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<Group>,
  ): Promise<Group[]> {
    const groupService = GroupService.getInstance<service.GroupService>();
    const result = await groupService.getGroupsByType(this._queryType);
    if (this._queryType === GROUP_QUERY_TYPE.FAVORITE) {
      console.info('dangerous', result);
    }
    return result;
  }
}

class SectionViewModel extends StoreViewModel implements SectionViewProps {
  constructor() {
    super();
    this.autorun(() => {
      this.updateGlobalGroups();
    });
    this.autorun(() => this.profileUpdateFavSection());
    this.autorun(() => this.profileUpdateGroupSections());
    this.autorun(() => this.handleProfileUpdateMoreGroups());
  }

  // @observable
  private _listHandler: FetchSortableDataListHandler<Group>;

  // @observable
  private _type: SECTION_TYPE;

  // @observable
  private _config: SectionConfig;

  @observable
  currentGroupId: number;

  @observable
  expanded: boolean = true;

  private _oldFavGroupIds: number[] = [];

  @computed
  get favGroupIds() {
    return (
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || []
    );
  }

  @observable
  profileMoreGroupsIds: number[] = [];

  @computed
  get profileMoreGroups() {
    const ids = this.profileMoreGroupsIds;
    return ids.map((id: number) => getEntity(ENTITY_NAME.GROUP, id));
  }

  profileUpdateFavSection() {
    const favGroupIds = this.favGroupIds;
    const condition =
      this._listHandler &&
      this._type &&
      this._type === SECTION_TYPE.FAVORITE &&
      this._oldFavGroupIds.toString() !== favGroupIds.toString();
    if (condition) {
      const newModels = favGroupIds.map((value: number, index: number) => {
        return {
          id: value,
          sortValue: 0,
        };
      });
      this._listHandler.replaceAll(newModels);
      this._oldFavGroupIds = favGroupIds;
    }
  }

  handleProfileUpdateMoreGroups() {
    const groups = this.profileMoreGroups;
    if (this._listHandler && this._type && groups.length) {
      const models = groups
        .filter((model: GroupModel) => {
          if (this._type === SECTION_TYPE.TEAM) {
            return model.isTeam;
          }
          return !model.isTeam;
        })
        .map((model: GroupModel) => {
          return {
            id: model.id,
            sortValue: -model.latestTime,
          };
        });
      this._listHandler.upsert(models);
      this.profileMoreGroupsIds = [];
    }
  }

  profileUpdateGroupSections() {
    const newFavIds = this.favGroupIds;

    const condition =
      this._type &&
      this._listHandler &&
      this._type !== SECTION_TYPE.FAVORITE &&
      newFavIds.sort().toString() !== this._oldFavGroupIds.sort().toString();
    if (condition) {
      const more = _.difference(this._oldFavGroupIds, newFavIds); // less fav more groups
      const less = _.difference(newFavIds, this._oldFavGroupIds); // less group more fav
      if (less.length) {
        this._listHandler.removeByIds(less);
      }
      if (more.length) {
        this.profileMoreGroupsIds = more;
      }
      this._oldFavGroupIds = newFavIds;
    }
  }

  @computed
  get sortable() {
    return this._config.sortable || false;
  }

  @computed
  get iconName() {
    return this._config.iconName;
  }

  @computed
  get title() {
    return this._config.title;
  }

  @computed
  get groupIds() {
    return this._listHandler.sortableListStore.getIds();
  }

  onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    return this.handleSortEnd(oldIndex, newIndex);
  }

  async onReceiveProps(props: SectionProps) {
    if (props.currentGroupId && this.currentGroupId !== props.currentGroupId) {
      this.currentGroupId = props.currentGroupId;
    }

    if (this._type !== props.type) {
      if (this._listHandler) {
        this._listHandler.dispose();
      }

      this._type = props.type;
      this._config = SECTION_CONFIGS[this._type];

      const dataProvider = new GroupDataProvider(this._config.queryType);
      this._listHandler = new FetchSortableDataListHandler(dataProvider, {
        isMatchFunc: this._config.isMatchFun,
        transformFunc: this._config.transformFun,
        entityName: ENTITY_NAME.GROUP,
        eventName: this._config.eventName,
      });
      await this.fetchGroups();
    }
  }

  @action
  async fetchGroups() {
    await this._listHandler.fetchData(FetchDataDirection.DOWN);
  }

  updateGlobalGroups() {
    if (this._config && this._listHandler) {
      storeManager
        .getGlobalStore()
        .set(
          this._config.queryType,
          this._listHandler.sortableListStore.getIds(),
        );
    }
  }

  handleSortEnd(oldIndex: number, newIndex: number) {
    const groupService = GroupService.getInstance<service.GroupService>();
    groupService.reorderFavoriteGroups(oldIndex, newIndex);
  }
}

export default SectionViewModel;
export { SectionViewModel };
