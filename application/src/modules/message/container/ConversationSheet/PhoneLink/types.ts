/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 10:20:44
 * Copyright © RingCentral. All rights reserved.
 */
type PhoneLinkProps = {
  key?: number;
  text: string;
  type?: 'phone' | 'conference';
  canUseConference?: boolean;
  handleClick?: (arg: string) => void;
};

type PhoneLinkViewProps = PhoneLinkProps & {
  isRCUser: boolean;
  canUseTelephony: boolean;
  directCall: (phoneNumber: string) => void;
  updateCanUseTelephony: () => Promise<void>;
};

export { PhoneLinkProps, PhoneLinkViewProps };
