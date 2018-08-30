import { IEntity } from './../store.d';
import { Profile } from 'sdk/models';
export default class ProfileModel implements IEntity {
  id: number;
  favoritePostIds: number[];
  constructor(data: Profile) {
    const { id, favorite_post_ids: favoritePostIds = [] } = data;
    this.favoritePostIds = favoritePostIds;
    this.id = id;
  }
  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
