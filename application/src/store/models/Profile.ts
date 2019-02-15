import _ from 'lodash';
import { observable } from 'mobx';
import { Profile } from 'sdk/module/profile/entity';
import Base from './Base';

export default class ProfileModel extends Base<Profile> {
  @observable
  favoritePostIds: number[];

  @observable
  favoriteGroupIds: number[];

  @observable
  hiddenGroupIds: number[] = [];

  @observable
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

    const hiddenGroupIds: number[] = [];
    Object.keys(data).forEach((key: string) => {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m && data[key] === true) {
        hiddenGroupIds.push(Number(m[2]));
      }
    });

    this.hiddenGroupIds = hiddenGroupIds;
  }

  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
