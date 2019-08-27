import { observable } from 'mobx';
import Base from './Base';
import { ConversationPreference } from 'sdk/module/profile/entity/Profile';
import {
  AUDIO_SOUNDS_INFO,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
} from 'sdk/module/profile';

export default class ConversationPreferenceModel extends Base<
  ConversationPreference
> {
  @observable muted: boolean;
  @observable desktopNotifications: boolean;
  @observable audioNotifications: AUDIO_SOUNDS_INFO;
  @observable pushNotifications: MOBILE_TEAM_NOTIFICATION_OPTIONS;
  @observable emailNotifications: EMAIL_NOTIFICATION_OPTIONS;

  constructor(data: ConversationPreference) {
    super(data);
    const {
      muted,
      desktopNotifications,
      audioNotifications,
      pushNotifications,
      emailNotifications,
    } = data;

    this.muted = muted;
    this.desktopNotifications = desktopNotifications;
    this.audioNotifications = audioNotifications;
    this.pushNotifications = pushNotifications;
    this.emailNotifications = emailNotifications;
  }

  static fromJS(data: ConversationPreference) {
    return new ConversationPreferenceModel(data);
  }
}
