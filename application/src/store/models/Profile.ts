import { Profile } from 'sdk/models';
import Base from './Base';
function extractHiddenGroupIds(profile: Profile): number[] {
  const clone = Object.assign({}, profile);
  const result: number[] = [];
  Object.keys(clone).forEach((key: string) => {
    if (clone[key] === true) {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m) {
        result.push(Number(m[2]));
      }
    }
  });
  return result;
}
export default class ProfileModel extends Base<Profile> {
  favoritePostIds: number[];
  favoriteGroupIds: number[];
  skipCloseConversationConfirmation: boolean;
  hiddenGroupIds: number[] = [];
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
    this.hiddenGroupIds = extractHiddenGroupIds(data);
  }
  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
