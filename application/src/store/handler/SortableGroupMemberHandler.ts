// /*
//  * @Author: Thomas thomas.yang@ringcentral.com
//  * @Date: 2018-11-20 14:37:25
//  * Copyright © RingCentral. All rights reserved.
//  */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base/fetch';

import { PersonService } from 'sdk/module/person';
import GroupService from 'sdk/service/group';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { ENTITY, EVENT_TYPES } from 'sdk/service';
import { ENTITY_NAME } from '@/store/constants';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { QUERY_DIRECTION } from 'sdk/dao';
class GroupMemberDataProvider implements IFetchSortableDataProvider<Person> {
  private _groupId: number;

  constructor(groupId: number) {
    this._groupId = groupId;
  }

  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor: ISortableModel<Person>,
  ): Promise<{ data: Person[]; hasMore: boolean }> {
    const personService = PersonService.getInstance<PersonService>();
    const group = await GroupService.getInstance<GroupService>().getById(
      this._groupId,
    );
    const result = await personService.getPersonsByIds(
      group && group.members ? group.members : [],
    );
    return { data: result, hasMore: false };
  }
}

class SortableGroupMemberHandler extends BaseNotificationSubscribable {
  private _sortableDataHandler: FetchSortableDataListHandler<Person>;
  private _group: Group;

  static async createSortableGroupMemberHandler(groupId: number) {
    const group = await GroupService.getInstance<GroupService>().getById(
      groupId,
    );
    if (group) {
      return new SortableGroupMemberHandler(group);
    }
    return null;
  }

  constructor(group: Group) {
    super();
    this._group = group;
    this._subscribeNotification();
    this._buildSortableMemberListHandler();
  }

  private _buildSortableMemberListHandler() {
    const dataProvider = new GroupMemberDataProvider(this._group.id);

    const isMatchFun = (model: Person) => {
      return model
        ? this._group.members.some((x: number) => x === model.id)
        : false;
    };

    const transformFun = (model: Person) => {
      return {
        id: model.id,
        sortValue: model.id,
        data: model,
      } as ISortableModel<Person>;
    };

    const personService = PersonService.getInstance<PersonService>();
    const sortMemberFunc = (
      lhs: ISortableModel<Person>,
      rhs: ISortableModel<Person>,
    ): number => {
      const lPerson = lhs.data!;
      const rPerson = rhs.data!;
      const groupService = GroupService.getInstance<GroupService>();

      if (this._group.is_team) {
        const isLAdmin = groupService.isTeamAdmin(
          lPerson.id,
          this._group.permissions,
        );
        const isRAdmin = groupService.isTeamAdmin(
          rPerson.id,
          this._group.permissions,
        );
        if (isLAdmin !== isRAdmin) {
          return isLAdmin ? -1 : 1;
        }
      }

      return natureCompare(
        personService.getFullName(lPerson),
        personService.getFullName(rPerson),
      );
    };

    this._sortableDataHandler = new FetchSortableDataListHandler(dataProvider, {
      isMatchFunc: isMatchFun,
      transformFunc: transformFun,
      entityName: ENTITY_NAME.PERSON,
      eventName: ENTITY.PERSON,
      sortFunc: sortMemberFunc,
    });
    this._fetchAllGroupMembers();
  }

  private _subscribeNotification() {
    this.subscribeNotification(
      ENTITY.GROUP,
      (payload: NotificationEntityPayload<Group>) => {
        if (payload.type === EVENT_TYPES.UPDATE) {
          const groupEntity = payload.body.entities.get(
            this._group.id,
          ) as Group;

          if (groupEntity) {
            this._handleGroupUpdate(groupEntity);
          }
        }
      },
    );
  }

  private _fetchAllGroupMembers() {
    this._sortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
  }

  private _handleGroupUpdate(newGroup: Group) {
    if (newGroup) {
      const sortFunc = (lhs: number, rhs: number) => lhs - rhs;
      const sortedNewMemberList = newGroup.members.sort(sortFunc);
      const sortedOldMemberList = this._group.members.sort(sortFunc);

      let needReplaceData = false;
      if (sortedNewMemberList.toString() !== sortedOldMemberList.toString()) {
        needReplaceData = true;
      }

      if (
        !needReplaceData &&
        newGroup.permissions &&
        this._group.permissions &&
        newGroup.permissions !== this._group.permissions
      ) {
        needReplaceData = true;
      }

      // get again
      this._group = newGroup;

      if (needReplaceData) {
        this._replaceData();
      }
    }
  }

  private async _replaceData() {
    const personService = PersonService.getInstance<PersonService>();
    const groupService = GroupService.getInstance<GroupService>();
    const group = await groupService.getById(this._group.id);
    const result = await personService.getPersonsByIds(
      group && group.members ? group.members : [],
    );

    this._sortableDataHandler.replaceAll(result);
  }

  getSortedGroupMembersIds() {
    return this._sortableDataHandler.sortableListStore.getIds();
  }
}

export default SortableGroupMemberHandler;
