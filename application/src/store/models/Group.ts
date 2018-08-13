import { observable } from 'mobx';

export default class GroupModel {
  id: number;
  @observable isTeam: boolean;
  @observable setAbbreviation: string;
  @observable members: number[];
  @observable description: string;
  @observable pinnedPostIds: number[];

  constructor(model: IGroup) {
    const {
      id,
      setAbbreviation,
      members,
      isTeam,
      description,
      pinnedPostIds,
    } = model;

    this.id = id;
    this.setAbbreviation = setAbbreviation;
    this.members = members;
    this.description = description;
    this.isTeam = isTeam;
    this.pinnedPostIds = pinnedPostIds;
  }

  static fromJS(data: any) {
    const {
      is_team: isTeam,
      set_abbreviation: setAbbreviation,
      id,
      members,
      description,
      pinned_post_ids: pinnedPostIds,
    } = data;
    const model = {
      id,
      isTeam,
      setAbbreviation,
      members,
      description,
      pinnedPostIds,
    };

    return new GroupModel(model);
  }

  dispose() {}
}
