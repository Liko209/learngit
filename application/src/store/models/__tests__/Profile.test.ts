/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-10 18:52:21
 * Copyright © RingCentral. All rights reserved.
 */

import ProfileModel from '../Profile';
import {
  CALLING_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
} from 'sdk/module/profile';

describe('Profile', () => {
  it('should create Profile with correct default values', () => {
    const data = {
      id: 456,
      isMocked: true,
    } as any;
    const profile = new ProfileModel(data);
    expect(profile.callOption).toEqual(CALLING_OPTIONS.GLIP);
    expect(profile.defaultNumberId).toBeUndefined();
    expect(profile.mobileDMNotification).toEqual(false);
    expect(profile.mobileTeamNotification).toEqual(
      MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF,
    );
    expect(profile.mobileMentionNotification).toEqual(false);
    expect(profile.mobileCallInfoNotification).toEqual(false);
    expect(profile.mobileVideoNotification).toEqual(false);
    expect(profile.emailDMNotification).toEqual(EMAIL_NOTIFICATION_OPTIONS.OFF);
    expect(profile.emailTeamNotification).toEqual(
      EMAIL_NOTIFICATION_OPTIONS.OFF,
    );
    expect(profile.emailMentionNotification).toEqual(false);
    expect(profile.emailTodayNotification).toEqual(false);
    expect(profile.desktopNotification).toEqual(false);
    expect(profile.desktopMessageOption).toEqual(
      DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
    );
    expect(profile.desktopCallOption).toEqual(false);
    expect(profile.desktopVoicemailOption).toEqual(false);
  });
});
