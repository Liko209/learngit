import _ from 'lodash';
import { observable } from 'mobx';
import { Profile } from 'sdk/module/profile/entity';
import {
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
  CALLING_OPTIONS,
} from 'sdk/module/profile';
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

  @observable
  callOption: CALLING_OPTIONS;

  @observable
  defaultNumberId: number;

  @observable
  mobileDMNotification: boolean;

  @observable
  mobileTeamNotification: MOBILE_TEAM_NOTIFICATION_OPTIONS;

  @observable
  mobileMentionNotification: boolean;

  @observable
  mobileCallInfoNotification: boolean;

  @observable
  mobileVideoNotification: boolean;

  @observable
  emailDMNotification: EMAIL_NOTIFICATION_OPTIONS;

  @observable
  emailTeamNotification: EMAIL_NOTIFICATION_OPTIONS;

  @observable
  emailMentionNotification: boolean;

  @observable
  emailTodayNotification: boolean;

  @observable
  desktopNotification: boolean;

  @observable
  desktopMessageOption: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS;

  @observable
  desktopCallOption: boolean;

  @observable
  desktopVoicemailOption: boolean;

  @observable
  maxLeftRailGroup: number;

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

    // settings
    this.callOption = data.calling_option || CALLING_OPTIONS.GLIP;
    this.defaultNumberId = data.default_number || 0;
    this.mobileDMNotification =
      data.want_push_people === NOTIFICATION_OPTIONS.ON;
    this.mobileTeamNotification =
      data.want_push_team || MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF;
    this.mobileMentionNotification =
      data.want_push_mentions === NOTIFICATION_OPTIONS.ON;
    this.mobileCallInfoNotification =
      data.want_push_faxes === NOTIFICATION_OPTIONS.ON;
    this.mobileVideoNotification =
      data.want_push_video_chat === NOTIFICATION_OPTIONS.ON;
    this.emailDMNotification =
      data.want_email_people || EMAIL_NOTIFICATION_OPTIONS.OFF;
    this.emailTeamNotification =
      data.want_email_team || EMAIL_NOTIFICATION_OPTIONS.OFF;
    this.emailMentionNotification =
      data.want_email_mentions === NOTIFICATION_OPTIONS.ON;
    this.emailTodayNotification =
      data.want_email_glip_today === NOTIFICATION_OPTIONS.ON;
    this.desktopNotification = data.want_desktop_notifications || false;
    this.desktopMessageOption =
      data.desktop_notifications_new_messages ||
      DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF;
    this.desktopCallOption =
      data.desktop_notifications_incoming_calls === NOTIFICATION_OPTIONS.ON;
    this.desktopVoicemailOption =
      data.desktop_notifications_new_voicemails === NOTIFICATION_OPTIONS.ON;
  }

  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
