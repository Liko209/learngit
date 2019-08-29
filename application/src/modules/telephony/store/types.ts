/*
 * @Author: Aaron Huo(aaron.huo@ringcentral.com)
 * @Date: 2019-08-22 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */

type VoicemailNotification = {
  id: number;
  title: string;
  body: string;
};

type MissedCallNotification = {
  id: string;
  title: string;
  body: string;
  displayNumber: string;
}

export { VoicemailNotification, MissedCallNotification };
