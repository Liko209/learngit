import { MyState } from 'sdk/module/state/entity';
import Base from './Base';
import { observable } from 'mobx';

export default class MyStateModel extends Base<MyState> {
  awayStatusHistory: string[];
  lastGroupId: number;
  @observable
  atMentionPostIds: number[];
  constructor(data: MyState) {
    super(data);
    const {
      away_status_history: awayStatusHistory = [],
      last_group_id: lastGroupId,
      at_mentioning_post_ids: atMentionPostIds,
    } = data;
    this.awayStatusHistory = awayStatusHistory;
    this.lastGroupId = lastGroupId;
    if (atMentionPostIds) {
      this.atMentionPostIds = atMentionPostIds;
    }
  }
  static fromJS(data: MyState) {
    return new MyStateModel(data);
  }
}
