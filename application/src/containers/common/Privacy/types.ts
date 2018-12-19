/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { IconButtonSize } from 'jui/components/Buttons';

type PrivacyProps = {
  id: number; // teamId
  size?: IconButtonSize;
};

type PrivacyViewProps = PrivacyProps & {
  isPublic: boolean;
  isAdmin: boolean;
  isOffline: boolean;
  handlePrivacy: () => Promise<boolean>;
};

export { PrivacyProps, PrivacyViewProps };
