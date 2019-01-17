import _ from 'lodash';
import { computed } from 'mobx';
import { Profile } from 'sdk/module/profile/entity';
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

    Object.keys(data).forEach((key: string) => {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m) {
        this[_.camelCase(key)] = data[key];
      }
    });
  }

  @computed
  get hiddenGroupIds() {
    const hiddenGroupIds: number[] = [];
    Object.keys(this).forEach((key: string) => {
      if (this[key] === true) {
        const m = key.match(new RegExp(`(${'hideGroup'})(\\d+)`));
        if (m) {
          hiddenGroupIds.push(Number(m[2]));
        }
      }
    });
    return hiddenGroupIds;
  }

  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
