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
import { getSingleEntity } from '@/store/utils';
import ProfileModel from '@/store/models/Profile';
import _ from 'lodash';
import StoreViewModel from '@/store/ViewModel';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  FetchDataDirection,
  ISortableModel,
} from '@/store/base/fetch';
import {
  SectionProps,
  SectionConfig,
  SectionConfigs,
  SectionViewProps,
  SECTION_TYPE,
} from './types';
import { GLOBAL_KEYS } from '@/store/constants';

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
    iconName: 'star_border',
    eventName: ENTITY.FAVORITE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.FAVORITE,
    globalKey: GLOBAL_KEYS.GROUP_QUERY_TYPE_FAVORITE_IDS,
    transformFun: favGroupTransformFunc,
    sortable: true,
    isMatchFun: (model: Group) => {
      return true;
    },
  },
  [SECTION_TYPE.DIRECT_MESSAGE]: {
    title: 'directMessage_plural',
    iconName: 'person_outline',
    eventName: ENTITY.PEOPLE_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.GROUP,
    globalKey: GLOBAL_KEYS.GROUP_QUERY_TYPE_GROUP_IDS,
    transformFun: groupTransformFunc,
    isMatchFun: (model: Group) => {
      return !model.is_team;
    },
  },
  [SECTION_TYPE.TEAM]: {
    title: 'team_plural',
    iconName: 'group',
    eventName: ENTITY.TEAM_GROUPS,
    entityName: ENTITY_NAME.GROUP,
    queryType: GROUP_QUERY_TYPE.TEAM,
    globalKey: GLOBAL_KEYS.GROUP_QUERY_TYPE_TEAM_IDS,
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
  ): Promise<{ data: Group[]; hasMore: boolean }> {
    const groupService = GroupService.getInstance<service.GroupService>();
    const result = await groupService.getGroupsByType(this._queryType);
    if (this._queryType === GROUP_QUERY_TYPE.FAVORITE) {
      console.info('dangerous', result);
    }
    return { data: result, hasMore: false };
  }
}

class SectionViewModel extends StoreViewModel<SectionProps>
  implements SectionViewProps {
  constructor(props?: SectionProps) {
    super(props);
    this._oldFavGroupIds =
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoriteGroupIds',
      ) || [];
    this.autorun(() => this.updateGlobalGroups());
    this.autorun(() => this.profileUpdateFavSection());
    this.autorun(() => this.profileUpdateGroupSections());
  }

  @observable
  private _listHandler: FetchSortableDataListHandler<Group>;

  @observable
  private _type: SECTION_TYPE;

  @observable
  private _config: SectionConfig;

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

  private _hasInitiated() {
    return this._listHandler && this._type;
  }

  async profileUpdateFavSection() {
    const favGroupIds = this.favGroupIds;
    const condition =
      this._hasInitiated() &&
      this._type === SECTION_TYPE.FAVORITE &&
      this._oldFavGroupIds.toString() !== favGroupIds.toString();
    if (condition) {
      this._oldFavGroupIds = favGroupIds;
      const groupService = GroupService.getInstance<service.GroupService>();
      const result = await groupService.getGroupsByType(
        GROUP_QUERY_TYPE.FAVORITE,
      );
      this._listHandler.replaceAll(result);
    }
  }

  async profileUpdateGroupSections() {
    const newFavIds = this.favGroupIds;
    const condition =
      this._hasInitiated() &&
      this._type !== SECTION_TYPE.FAVORITE &&
      newFavIds.sort().toString() !== this._oldFavGroupIds.sort().toString();
    if (condition) {
      const more = _.difference(this._oldFavGroupIds, newFavIds); // less fav more groups
      const less = _.difference(newFavIds, this._oldFavGroupIds); // less group more fav
      this._oldFavGroupIds = newFavIds;
      if (less.length) {
        this._listHandler.removeByIds(less);
      }
      if (more.length) {
        const groupService = GroupService.getInstance<service.GroupService>();
        const result = await groupService.getGroupsByIds(more);
        this._listHandler.upsert(result);
      }
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
    if (this._type !== props.type) {
      if (this._listHandler) {
        this._listHandler.dispose();
      }

      this._type = props.type;
      this._config = SECTION_CONFIGS[this._type];
      if (this._type === SECTION_TYPE.FAVORITE) {
        this._config.isMatchFun = (model: Group) => {
          return this._oldFavGroupIds.indexOf(model.id) !== -1;
        };
        this._config['transformFun'] = (model: Group) => {
          return {
            id: model.id,
            sortValue: this._oldFavGroupIds.indexOf(model.id),
          } as ISortableModel<Group>;
        };
      } else {
        this._config.isMatchFun = (model: Group) => {
          const notInFav = this._oldFavGroupIds.indexOf(model.id) === -1;
          const isTeamInTeamSection =
            this._type === SECTION_TYPE.TEAM && model.is_team;
          const isDirectInDirectSection =
            this._type === SECTION_TYPE.DIRECT_MESSAGE && !model.is_team;
          return notInFav && (isTeamInTeamSection || isDirectInDirectSection);
        };
      }

      const dataProvider = new GroupDataProvider(this._config.queryType);
      this._listHandler = new FetchSortableDataListHandler(dataProvider, {
        isMatchFunc: this._config.isMatchFun,
        transformFunc: this._config.transformFun,
        entityName: ENTITY_NAME.GROUP,
        eventName: this._config.eventName,
      });
      await this.fetchGroups();
      this.updateGlobalGroups();
    }
  }

  @action
  async fetchGroups() {
    await this._listHandler.fetchData(FetchDataDirection.DOWN);
  }

  @action
  updateGlobalGroups() {
    if (this._config && this._listHandler) {
      storeManager
        .getGlobalStore()
        .set(
          this._config.globalKey,
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
