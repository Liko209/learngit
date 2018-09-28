import { observable } from 'mobx';
import { GroupState } from 'sdk/models';
import Base from './Base';

export default class GroupStateModel extends Base<GroupState> {
  @observable
  unreadCount?: number;
  @observable
  unreadMentionsCount?: number;

  constructor(data: GroupState) {
    super(data);
    const { unread_count, unread_mentions_count } = data;

    this.unreadCount = unread_count;
    this.unreadMentionsCount = unread_mentions_count;
  }

  static fromJS(data: GroupState) {
    return new GroupStateModel(data);
  }
}
