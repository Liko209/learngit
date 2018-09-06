import { Profile } from 'sdk/models';
import Base from './Base';
export default class ProfileModel extends Base<Profile> {
  favoritePostIds: number[];
  favoriteGroupIds: number[];
  constructor(data: Profile) {
    super(data);
    const {
      favorite_post_ids: favoritePostIds = [],
      favorite_group_ids: favoriteGroupIds = [],
    } = data;
    this.favoritePostIds = favoritePostIds;
    this.favoriteGroupIds = favoriteGroupIds;
  }
  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
