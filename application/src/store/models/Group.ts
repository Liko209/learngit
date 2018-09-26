import { observable } from 'mobx';
import { Group } from 'sdk/models';
import Base from './Base';

export default class GroupModel extends Base<Group> {
  id: number;
  @observable
  isTeam?: boolean;
  @observable
  setAbbreviation: string;
  @observable
  members: number[];
  @observable
  description?: string;
  @observable
  pinnedPostIds?: number[];
  @observable
  privacy?: string;
  @observable
  draft?: string;
  @observable
  sendFailurePostIds?: number[];

  constructor(data: Group) {
    super(data);
    const {
      set_abbreviation,
      members,
      is_team,
      description,
      pinned_post_ids,
      privacy,
      draft,
      send_failure_post_ids,
    } = data;

    this.setAbbreviation = set_abbreviation;
    this.members = members;
    this.description = description;
    this.isTeam = is_team;
    this.pinnedPostIds = pinned_post_ids;
    this.privacy = privacy;
    this.draft = draft;
    this.sendFailurePostIds = send_failure_post_ids;
  }

  static fromJS(data: Group) {
    return new GroupModel(data);
  }
}
