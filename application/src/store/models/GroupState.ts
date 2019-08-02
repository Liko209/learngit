import { observable } from 'mobx';
import { GroupState } from 'sdk/module/state/entity';
import Base from './Base';

export default class GroupStateModel extends Base<GroupState> {
  @observable
  unreadCount?: number;
  @observable
  unreadMentionsCount?: number;
  @observable
  unreadTeamMentionsCount?: number;
  @observable
  readThrough?: number;
  @observable
  lastReadThrough?: number;

  constructor(data: GroupState) {
    super(data);
    const {
      unread_count,
      unread_mentions_count,
      unread_team_mentions_count,
      read_through,
      last_read_through,
    } = data;

    this.unreadCount = unread_count;
    this.unreadMentionsCount = unread_mentions_count || 0;
    this.unreadTeamMentionsCount = unread_team_mentions_count || 0;
    this.readThrough = read_through;
    this.lastReadThrough = last_read_through;
  }

  static fromJS(data: GroupState) {
    return new GroupStateModel(data);
  }
}
