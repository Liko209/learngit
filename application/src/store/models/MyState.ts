import { IEntity } from './../store.d';
import { MyState } from 'sdk/models';

export default class MyStateModel implements IEntity {
  id: number;
  awayStatusHistory: string[];
  constructor(data: MyState) {
    const { id, away_status_history: awayStatusHistory = [] } = data;
    this.id = id;
    this.awayStatusHistory = awayStatusHistory;
  }
  static fromJS(data: MyState) {
    return new MyStateModel(data);
  }
}
