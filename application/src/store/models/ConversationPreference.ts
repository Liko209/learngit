import { observable } from 'mobx';
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
  @observable desktopNotification: boolean;
  @observable soundNotification: AUDIO_SOUNDS_INFO;
  @observable pushNotification: MOBILE_TEAM_NOTIFICATION_OPTIONS;
  @observable emailNotification: EMAIL_NOTIFICATION_OPTIONS;

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
    this.desktopNotification = desktop_notifications;
    this.soundNotification = sound_notifications;
    this.pushNotification = push_notifications;
    this.emailNotification = email_notifications;
  }

  static fromJS(data: ConversationPreference) {
    return new ConversationPreferenceModel(data);
  }
}
