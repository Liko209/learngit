/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-20 14:37:25
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  ISortableModelWithData,
} from '@/store/base/fetch';

import { PersonService } from 'sdk/module/person';
import GroupService from 'sdk/module/group';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { ENTITY, EVENT_TYPES } from 'sdk/service';
import { ENTITY_NAME } from '@/store/constants';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { QUERY_DIRECTION } from 'sdk/dao';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { IdListPagingDataProvider } from '../base/fetch/IdListPagingDataProvider';
import PersonModel from '@/store/models/Person';
import { IEntityDataProvider, IMatchFunc } from '../base/fetch/types';
import { PerformanceTracer, PERFORMANCE_KEYS } from 'sdk/utils/performance';
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
      eventName: ENTITY.PERSON,
      entityName: ENTITY_NAME.PERSON,
      entityDataProvider: new PersonProvider(),
    };
    super(sortedGroupMembers, options);
  }
}

class SortableGroupMemberHandler extends BaseNotificationSubscribable {
  private _foc: FetchSortableDataListHandler<Person>;
  private _groupMemberDataProvider: GroupMemberDataProvider;
  private _group: Group;
  private _adminIds: Set<number>;
  private _sortedGroupMembers: number[];

  constructor(private _groupId: number) {
    super();
  }

  async fetchGroupMembersByPage(pageSize: number) {
    if (!this._isInitialized()) {
      const tracer = PerformanceTracer.initial();
      await this._initGroupData();
      await this._buildFoc();
      tracer.end({
        key: PERFORMANCE_KEYS.LOAD_GROUP_MEMBERS,
        count:
          (this._sortedGroupMembers && this._sortedGroupMembers.length) || 0,
      });
    }
    return this._foc.fetchData(QUERY_DIRECTION.NEWER, pageSize);
  }

  getSortedGroupMembersIds() {
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
  }

  private async _sortGroupMembers() {
    let sortedIds: number[] = [];
    if (this._group && this._group.members && this._group.members.length) {
      this._cacheAdmins();
      const groupMembers = await this.personService.getPersonsByIds(
        this._group.members,
      );
      const sortedMembers = groupMembers.sort(this._sortGroupMemberFunc);
      sortedIds = sortedMembers.map((member: Person) => {
        return member.id;
      });
    }

    this._sortedGroupMembers = sortedIds;
  }

  private async _initGroupData() {
    const group = await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).getById(this._groupId);

    if (group) {
      this._group = group;
      await this._sortGroupMembers();
      this._subscribeGroupChange();
    }
  }

  private async _buildFoc() {
    const filterFunc = <T extends { id: number; deactivated: boolean }>(
      model: T,
    ) => {
      return model && !model.deactivated
        ? this._group.members.some((x: number) => x === model.id)
        : false;
    };
    const isMatchFun = _.cloneDeep(filterFunc);

    const transformFun = (model: Person) => {
      return {
        id: model.id,
        sortValue: model.id,
      } as ISortableModelWithData<Person>;
    };

    const sortMemberFunc = (
      lhs: ISortableModelWithData<Person>,
      rhs: ISortableModelWithData<Person>,
    ): number => {
      return (
        this._sortedGroupMembers.indexOf(lhs.id) -
        this._sortedGroupMembers.indexOf(rhs.id)
      );
    };

    this._groupMemberDataProvider = new GroupMemberDataProvider(
      this._sortedGroupMembers,
      filterFunc,
    );

    this._foc = new FetchSortableDataListHandler(
      this._groupMemberDataProvider,
      {
        isMatchFunc: isMatchFun,
        transformFunc: transformFun,
        entityName: ENTITY_NAME.PERSON,
        eventName: ENTITY.PERSON,
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

  private _isInitialized() {
    return this._foc!!;
  }

  private _handleGroupUpdate(newGroup: Group) {
    if (!this._isInitialized()) {
      return;
    }

    if (newGroup) {
      const sortFunc = (lhs: number, rhs: number) => lhs - rhs;
      const sortedNewMemberList = newGroup.members.sort(sortFunc);
      const sortedOldMemberList = this._group.members.sort(sortFunc);

      let needUpdateMemberList = false;
      if (sortedNewMemberList.toString() !== sortedOldMemberList.toString()) {
        needUpdateMemberList = true;
      }

      if (!needUpdateMemberList && newGroup.is_team) {
        const oldAdmins = Array.from(this._adminIds).sort(sortFunc);
        let newAdmins =
          (newGroup.permissions &&
            newGroup.permissions.admin &&
            newGroup.permissions.admin.uids) ||
          [];
        newAdmins = newAdmins.sort(sortFunc);
        needUpdateMemberList = !_.isEqual(oldAdmins, newAdmins);
      }

      if (needUpdateMemberList) {
        this._initGroupData().then(() => {
          this._groupMemberDataProvider.onSourceIdsChanged(
            this._sortedGroupMembers,
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
}

export default SortableGroupMemberHandler;
