import { observable, computed } from 'mobx';
import { Profile } from 'sdk/module/profile/entity';
import {
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
  CALLING_OPTIONS,
  VIDEO_SERVICE_OPTIONS,
} from 'sdk/module/profile';
import Base from './Base';
import { NEW_MESSAGE_BADGES_OPTIONS } from 'sdk/module/profile/constants';

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
  defaultNumberId: number | undefined;

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
  lastReadMissed: number | undefined;

  @observable
  newMessageBadges: string;

  @observable
  videoService: string;

  @observable
  rcvBeta: boolean;

  @observable
  showLinkPreviews: boolean;

  constructor(data: Profile) {
    super(data);
    const {
      favorite_post_ids: favoritePostIds = [],
      favorite_group_ids: favoriteGroupIds = [],
      skip_close_conversation_confirmation: skipCloseConversationConfirmation = false,
      show_link_previews = true,
    } = data;

    this.favoritePostIds = favoritePostIds;
    this.favoriteGroupIds = favoriteGroupIds;
    this.skipCloseConversationConfirmation = skipCloseConversationConfirmation;
    this.showLinkPreviews = show_link_previews;
    const hiddenGroupIds: number[] = [];
    Object.keys(data).forEach((key: string) => {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m && data[key] === true) {
        hiddenGroupIds.push(Number(m[2]));
      }
    });

    this.hiddenGroupIds = hiddenGroupIds;
    // TODO, refactor these default value, should move them into a map or standalone file
    // settings
    this.callOption = data.calling_option || CALLING_OPTIONS.GLIP;
    this.newMessageBadges =
      data.new_message_badges || NEW_MESSAGE_BADGES_OPTIONS.ALL;
    this.defaultNumberId = data.default_number;
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
    this.lastReadMissed = data.last_read_missed;
    // video_service
    this.videoService =
      data.video_service || VIDEO_SERVICE_OPTIONS.RINGCENTRAL_MEETINGS;
    this.rcvBeta = !!data.rcv_beta;
  }

  @computed
  get isRCVService() {
    return (
      this.videoService === VIDEO_SERVICE_OPTIONS.RINGCENTRAL_VIDEO_EMBEDDED
    );
  }

  static fromJS(data: Profile) {
    return new ProfileModel(data);
  }
}
