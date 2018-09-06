import { MyState } from 'sdk/models';
import Base from './Base';

export default class MyStateModel extends Base<MyState> {
  awayStatusHistory: string[];
  constructor(data: MyState) {
    super(data);
    const { away_status_history: awayStatusHistory = [] } = data;
    this.awayStatusHistory = awayStatusHistory;
  }
  static fromJS(data: MyState) {
    return new MyStateModel(data);
  }
}
