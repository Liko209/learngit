// /*
//  * @Author: Thomas thomas.yang@ringcentral.com
//  * @Date: 2018-11-20 14:37:25
//  * Copyright © RingCentral. All rights reserved.
//  */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  FetchDataDirection,
  ISortableModel,
} from '@/store/base/fetch';

import PersonService from 'sdk/service/person';
import BaseNotificationSubscribable from '@/store/base/BaseNotificationSubscribable';
import GroupModel from '@/store/models/Group';
import { Person, Group } from 'sdk/models';
import { ENTITY, EVENT_TYPES } from 'sdk/src/service';
import { ENTITY_NAME } from '@/store/constants';
import { getEntity } from '@/store/utils';
import { NotificationEntityPayload } from 'sdk/src/service/notificationCenter';
import { PersonDataHandler } from 'sdk/src/service/person';
import { caseInsensitive as natureCompare } from 'string-natural-compare';

class GroupMemberDataProvider implements IFetchSortableDataProvider<Person> {
  private _groupId: number;

  constructor(groupId: number) {
    this._groupId = groupId;
  }

  async fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<Person>,
  ): Promise<{ data: Person[]; hasMore: boolean }> {
    const personService = PersonService.getInstance<PersonService>();
    const result = await personService.getPersonsByGroupId(this._groupId);
    return { data: result, hasMore: false };
  }
}

class SortableGroupMemberHandler extends BaseNotificationSubscribable {
  private _sortableDataHandler: FetchSortableDataListHandler<Person>;
  private _group: GroupModel;

  constructor(groupId: number) {
    super();
    this._group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
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
      } as ISortableModel<Person>;
    };

    const sortMemberFunc = (
      lhs: ISortableModel<Person>,
      rhs: ISortableModel<Person>,
    ): number => {
      const lPerson = lhs.data!;
      const rPerson = rhs.data!;
      const isLAdmin = this._group.isThePersonAdmin(lPerson.id);
      const isRAdmin = this._group.isThePersonAdmin(rPerson.id);
      if (isLAdmin !== isRAdmin) {
        return isLAdmin ? 1 : -1;
      }

      return natureCompare(
        PersonDataHandler.getInstance().getPersonDisplayName(lPerson),
        PersonDataHandler.getInstance().getPersonDisplayName(rPerson),
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
    this._sortableDataHandler.fetchData(FetchDataDirection.DOWN);
  }

  private _handleGroupUpdate(newGroup: Group) {
    if (newGroup) {
      const sortFunc = (lhs: number, rhs: number) => lhs - rhs;

      const sortedNewMemberList = newGroup.members.sort(sortFunc);
      const sortedOldMemberList = this._group.members.sort(sortFunc);

      let needReplaceData = false;
      if (sortedNewMemberList.toString !== sortedOldMemberList.toString) {
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
      this._group = getEntity<Group, GroupModel>(
        ENTITY_NAME.GROUP,
        this._group.id,
      );

      if (needReplaceData) {
        this._replaceData();
      }

      this._sortableDataHandler.replaceAll;
    }
  }

  private async _replaceData() {
    const personService = PersonService.getInstance<PersonService>();
    const result = await personService.getPersonsByGroupId(this._group.id);
    this._sortableDataHandler.replaceAll(result);
  }

  getSortedGroupMembersIds() {
    return this._sortableDataHandler.sortableListStore.getIds();
  }
}

export { SortableGroupMemberHandler };
