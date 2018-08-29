import { IEntity } from './../store.d';
import { observable } from 'mobx';
import { Group } from 'sdk/models';

export default class GroupModel implements IEntity {
  id: number;
  @observable isTeam?: boolean;
  @observable setAbbreviation: string;
  @observable members: number[];
  @observable description?: string;
  @observable pinnedPostIds?: number[];

  constructor(data: Group) {
    const {
      id,
      set_abbreviation,
      members,
      is_team,
      description,
      pinned_post_ids,
    } = data;

    this.id = id;
    this.setAbbreviation = set_abbreviation;
    this.members = members;
    this.description = description;
    this.isTeam = is_team;
    this.pinnedPostIds = pinned_post_ids;
  }

  static fromJS(data: Group) {
    return new GroupModel(data);
  }

  dispose() { }
}
