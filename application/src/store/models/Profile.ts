import { Profile } from 'sdk/models';
import Base from './Base';
export default class ProfileModel extends Base<Profile> {
  favoritePostIds: number[];
  favoriteGroupIds: number[];
  skipCloseConversationConfirmation: boolean;
  constructor(data: Profile) {
    super(data);
    const {
      favorite_post_ids: favoritePostIds = [],
      favorite_group_ids: favoriteGroupIds = [],
      skip_close_conversation_confirmation: skipCloseConversationConfirmation = false,
    } = data;
    this.favoritePostIds = favoritePostIds;
    this.favoriteGroupIds = favoriteGroupIds;
    this.skipCloseConversationConfirmation = skipCloseConversationConfirmation;
  }
  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
