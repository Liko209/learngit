import { MyState } from 'sdk/models';
import Base from './Base';

export default class MyStateModel extends Base<MyState> {
  awayStatusHistory: string[];
  lastGroupId: number;
  constructor(data: MyState) {
    super(data);
    const {
      away_status_history: awayStatusHistory = [],
      last_group_id: lastGroupId,
    } = data;
    this.awayStatusHistory = awayStatusHistory;
    this.lastGroupId = lastGroupId;
  }
  static fromJS(data: MyState) {
    return new MyStateModel(data);
  }
}
