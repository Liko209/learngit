import { observable, action } from 'mobx';
import Base from './Base';
import { ConversationPreference } from 'sdk/module/profile/entity/Profile';
import {
  AUDIO_SOUNDS_INFO,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
} from 'sdk/src/module/profile';

export default class ConversationPreferenceModel extends Base<
  ConversationPreference
> {
  @observable muteAll: boolean;
  @observable desktopNotifications: boolean;
  @observable soundNotifications: AUDIO_SOUNDS_INFO;
  @observable pushNotifications: MOBILE_TEAM_NOTIFICATION_OPTIONS;
  @observable emailNotifications: EMAIL_NOTIFICATION_OPTIONS;

  constructor(data: ConversationPreference) {
    super(data);
    const {
      muted,
      desktop_notifications,
      sound_notifications,
      push_notifications,
      email_notifications,
    } = data;

    this.muteAll = muted;
    this.desktopNotifications = desktop_notifications;
    this.soundNotifications = sound_notifications;
    this.pushNotifications = push_notifications;
    this.emailNotifications = email_notifications;
  }

  static fromJS(data: ConversationPreference) {
    return new ConversationPreferenceModel(data);
  }
}
