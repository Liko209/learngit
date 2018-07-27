import { observable } from 'mobx';

export default class GroupStateModel {
  id: number;
  @observable unread_count: number;
  @observable unread_mentions_count: number;

  constructor(model: IGroupState) {
    const { id, unread_count, unread_mentions_count } = model;

    this.id = id;
    this.unread_count = unread_count;
    this.unread_mentions_count = unread_mentions_count;
  }

  static fromJS(data: any) {
    return new GroupStateModel(data);
  }

  dispose() {} // eslint-disable-line
}
