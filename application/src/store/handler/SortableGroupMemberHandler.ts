/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-20 14:37:25
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable } from 'mobx';
import {
  FetchSortableDataListHandler,
  ISortableModelWithData,
} from '@/store/base/fetch';

import { PersonService } from 'sdk/module/person';
import GroupService from 'sdk/module/group';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { ENTITY, ENTITY_LIST, EVENT_TYPES } from 'sdk/service';
import { ENTITY_NAME } from '@/store/constants';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { QUERY_DIRECTION } from 'sdk/dao';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { IdListPagingDataProvider } from '../base/fetch/IdListPagingDataProvider';
import PersonModel from '@/store/models/Person';
import { IEntityDataProvider, IMatchFunc } from '../base/fetch/types';
import { STORE_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { PerformanceTracer } from 'foundation/performance';

class PersonProvider implements IEntityDataProvider<Person> {
  async getByIds(ids: number[]) {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    return await personService.getPersonsByIds(ids);
  }
}

class GroupMemberDataProvider extends IdListPagingDataProvider<
  Person,
  PersonModel
> {
  constructor(
    sortedGroupMembers: number[],
    filterFunc: IMatchFunc<PersonModel>,
  ) {
    const options = {
      filterFunc,
      eventName: ENTITY_LIST.GROUP_MEMBER,
      entityName: ENTITY_NAME.PERSON,
      entityDataProvider: new PersonProvider(),
    };
    super(sortedGroupMembers, options);
  }
}

class SortableGroupMemberHandler extends BaseNotificationSubscribable {
  @observable
  private _foc: FetchSortableDataListHandler<Person>;
  private _groupMemberDataProvider: GroupMemberDataProvider;
  private _group: Group;
  private _adminIds: Set<number>;
  @observable
  private _sortedGroupMemberIds: number[];
  private _isFetchBegin = false;

  constructor(private _groupId: number) {
    super();
  }

  async fetchGroupMembersByPage(pageSize: number) {
    if (!this._isFetchBegin) {
      this._isFetchBegin = true;
      await this._initGroupData();
      await this._buildFoc();
    }
    return this._foc && this._foc.fetchData(QUERY_DIRECTION.NEWER, pageSize);
  }

  @computed
  get allSortedMemberIds() {
    return this._sortedGroupMemberIds || [];
  }

  @computed
  get sortedMemberIds() {
    return this._foc ? this._foc.sortableListStore.getIds : [];
  }

  private _sortGroupMemberFunc = (lPerson: Person, rPerson: Person) => {
    const personService = this.personService;
    if (this._adminIds && this._group.is_team) {
      const isLAdmin = this._adminIds.has(lPerson.id);
      const isRAdmin = this._adminIds.has(rPerson.id);
      if (isLAdmin !== isRAdmin) {
        return isLAdmin ? -1 : 1;
      }
    }

    const lName = personService.getFullName(lPerson).toLowerCase();
    const rName = personService.getFullName(rPerson).toLowerCase();
    return lName < rName ? -1 : lName > rName ? 1 : 0;
  };

  private async _sortGroupMembers() {
    let sortedIds: number[] = [];
    if (this._group && this._group.members && this._group.members.length) {
      this._cacheAdmins();
      const groupMembers = await this.personService.getPersonsByIds(
        this._group.members,
      );
      const sortedMembers = groupMembers.sort(this._sortGroupMemberFunc);
      sortedIds = sortedMembers.map((member: Person) => member.id);
    }

    this._sortedGroupMemberIds = sortedIds;
  }

  private async _initGroupData() {
    const tracer = PerformanceTracer.start();
    const group = await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).getById(this._groupId);

    if (group) {
      this._group = _.cloneDeep(group);
      await this._sortGroupMembers();
      this._subscribeGroupChange();
    }
    tracer.end({
      key: STORE_PERFORMANCE_KEYS.INIT_GROUP_MEMBERS,
      count:
        (this._sortedGroupMemberIds && this._sortedGroupMemberIds.length) || 0,
    });
  }

  private async _buildFoc() {
    const filterFunc = <T extends { id: number; deactivated: boolean }>(
      model: T,
    ) =>
      model && !model.deactivated
        ? this._group.members.some((x: number) => x === model.id)
        : false;
    const isMatchFunc = filterFunc;

    const transformFun = (model: Person) =>
      ({
        id: model.id,
        sortValue: model.id,
      } as ISortableModelWithData<Person>);

    const sortMemberFunc = (
      lhs: ISortableModelWithData<Person>,
      rhs: ISortableModelWithData<Person>,
    ): number =>
      this._sortedGroupMemberIds.indexOf(lhs.id) -
      this._sortedGroupMemberIds.indexOf(rhs.id);

    this._groupMemberDataProvider = new GroupMemberDataProvider(
      this._sortedGroupMemberIds,
      filterFunc,
    );

    this._foc = new FetchSortableDataListHandler(
      this._groupMemberDataProvider,
      {
        isMatchFunc,
        transformFunc: transformFun,
        entityName: ENTITY_NAME.PERSON,
        eventName: ENTITY_LIST.GROUP_MEMBER,
        sortFunc: sortMemberFunc,
      },
    );
  }

  private _subscribeGroupChange() {
    this.subscribeNotification(
      ENTITY.GROUP,
      (payload: NotificationEntityPayload<Group>) => {
        if (payload.type === EVENT_TYPES.UPDATE) {
          const group = payload.body.entities.get(this._groupId) as Group;
          if (group) {
            this._handleGroupUpdate(group);
          }
        }
      },
    );
  }

  private async _handleGroupUpdate(newGroup: Group) {
    if (!this._foc) {
      return;
    }

    if (newGroup) {
      const sortFunc = (lhs: number, rhs: number) => lhs - rhs;
      const sortedNewMemberList = newGroup.members.sort(sortFunc);
      const sortedOldMemberList = this._group.members.sort(sortFunc);

      let needUpdateMemberList = !_.isEqual(
        sortedNewMemberList,
        sortedOldMemberList,
      );

      if (!needUpdateMemberList && newGroup.is_team) {
        const oldAdmins = Array.from(this._adminIds).sort(sortFunc);
        let newAdmins =
          (newGroup.permissions &&
            newGroup.permissions.admin &&
            newGroup.permissions.admin.uids) ||
          [];
        newAdmins = newAdmins.sort(sortFunc);
        needUpdateMemberList = !_.isEqual(newAdmins, oldAdmins);
      }

      if (needUpdateMemberList) {
        this._initGroupData().then(() => {
          this._groupMemberDataProvider.onSourceIdsChanged(
            this._sortedGroupMemberIds,
          );
        });
      }
    }
  }

  private _cacheAdmins() {
    if (
      this._group.is_team &&
      this._group.permissions &&
      this._group.permissions.admin &&
      this._group.permissions.admin.uids
    ) {
      this._adminIds = new Set(this._group.permissions.admin.uids);
    }
  }

  private get personService() {
    return ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
  }

  dispose() {
    this._isFetchBegin = false;
    this._foc && this._foc.dispose();
    super.dispose();
  }
}

export default SortableGroupMemberHandler;
