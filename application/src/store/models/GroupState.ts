import { IEntity } from './../store.d';
import { observable } from 'mobx';
import { GroupState } from 'sdk/models';

export default class GroupStateModel implements IEntity {
  id: number;
  @observable unreadCount?: number;
  @observable unreadMentionsCount?: number;

  constructor(data: GroupState) {
    const { id, unread_count, unread_mentions_count } = data;

    this.id = id;
    this.unreadCount = unread_count;
    this.unreadMentionsCount = unread_mentions_count;
  }

  static fromJS(data: GroupState) {
    return new GroupStateModel(data);
  }

  dispose() { }
}
